import os
import json
from fastapi import FastAPI, Request
import requests
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from a .env file
load_dotenv()

app = FastAPI()

# Facebook API credentials from environment variables
ACCESS_TOKEN = os.getenv('FACEBOOK_ACCESS_TOKEN')

# Slack Webhook URL from environment variables
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

# Load campaigns data from JSON file
json_file_path = os.path.join(os.path.dirname(__file__), 'campaigns.json')
with open(json_file_path, 'r') as file:
    campaigns_data = json.load(file)

def get_campaigns_and_spend(ad_account_id, campaign_name, start_date, end_date, access_token):
    url = f"https://graph.facebook.com/v17.0/act_{ad_account_id}/campaigns"
    params = {
        'fields': f'name,insights.time_range({{"since":"{start_date}","until":"{end_date}"}}){{spend}}',
        'filtering': json.dumps([{'field': 'campaign.name', 'operator': 'CONTAIN', 'value': campaign_name}]),
        'access_token': access_token
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return data['data']

def get_all_campaigns_spend_this_month(ad_account_id, excluded_campaign_names, access_token):
    filtering = [{'field': 'campaign.name', 'operator': 'NOT_CONTAIN', 'value': name} for name in excluded_campaign_names]
    
    url = f"https://graph.facebook.com/v17.0/act_{ad_account_id}/insights"
    params = {
        'fields': 'campaign_name,campaign_id,spend',
        'level': 'campaign',
        'date_preset': 'this_month',
        'filtering': json.dumps(filtering),
        'access_token': access_token
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return data['data']

def calculate_days_in_period(start_date, end_date):
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    return (end - start).days + 1

def calculate_spending_track(spend, set_budget, start_date, end_date):
    total_days = calculate_days_in_period(start_date, end_date)
    daily_budget = set_budget / total_days
    
    today = datetime.today()
    start = datetime.strptime(start_date, "%Y-%m-%d")
    
    days_elapsed = (today - start).days + 1
    if days_elapsed > total_days:
        days_elapsed = total_days
    
    expected_spend = daily_budget * days_elapsed
    offset_amount = spend - expected_spend
    on_track = spend <= expected_spend
    
    remaining_days = total_days - days_elapsed
    remaining_budget = set_budget - spend
    suggested_daily_budget = remaining_budget / remaining_days if remaining_days > 0 else 0
    
    return on_track, expected_spend, offset_amount, suggested_daily_budget

def send_slack_message(message):
    headers = {'Content-Type': 'application/json'}
    data = json.dumps({'text': message})
    response = requests.post(SLACK_WEBHOOK_URL, headers=headers, data=data)
    response.raise_for_status()

@app.get("/api/facebook/spend")
def facebook_ad_spend(request: Request):
    try:
        send_slack = request.query_params.get('send_slack', 'false').lower() == 'true'
        account_spends = []
        slack_message = "*Facebook Ads Spend Report*\n"
        excluded_campaign_names = {campaign['name'] for account in campaigns_data for campaign in account['campaigns']}
        
        for account in campaigns_data:
            account_name = account['name']
            ad_account_id = account['id']
            campaign_details = []
            slack_message += f"\n*Account: {account_name}*\n"
            for campaign in account['campaigns']:
                campaign_name = campaign['name']
                start_date = campaign['start_date']
                end_date = campaign['end_date']
                set_budget = campaign['set_budget']
                
                campaign_data_list = get_campaigns_and_spend(ad_account_id, campaign_name, start_date, end_date, ACCESS_TOKEN)
                for campaign_data in campaign_data_list:
                    insights = campaign_data.get('insights', {}).get('data', [])
                    spend = sum(float(insight['spend']) for insight in insights)
                    on_track, expected_spend, offset_amount, suggested_daily_budget = calculate_spending_track(spend, set_budget, start_date, end_date)
                    campaign_details.append({
                        "name": campaign_name,
                        "start_date": start_date,
                        "end_date": end_date,
                        "set_budget": set_budget,
                        "daily_budget": set_budget / calculate_days_in_period(start_date, end_date),
                        "spend": spend,
                        "expected_spend": expected_spend,
                        "offset_amount": offset_amount,
                        "on_track": on_track,
                        "suggested_daily_budget": suggested_daily_budget
                    })
                    slack_message += (
                        f"  *Campaign: {campaign_name}*\n"
                        f"    • Start Date: {start_date}\n"
                        f"    • End Date: {end_date}\n"
                        f"    • Set Budget: ${set_budget:.2f}\n"
                        f"    • Spend: ${spend:.2f}\n"
                        f"    • Expected Spend: ${expected_spend:.2f}\n"
                        f"    • Offset Amount: ${offset_amount:.2f}\n"
                        f"    • On Track: {'Yes' if on_track else 'No'}\n"
                        f"    • Suggested Daily Budget: ${suggested_daily_budget:.2f}\n"
                    )
            
            account_spends.append({
                "account_name": account_name,
                "campaigns": campaign_details
            })
            
            # Get all campaigns that have spent money this month but are not included in the JSON file
            all_campaigns_spend = get_all_campaigns_spend_this_month(ad_account_id, excluded_campaign_names, ACCESS_TOKEN)
            for campaign in all_campaigns_spend:
                campaign_name = campaign['campaign_name']
                spend = float(campaign['spend'])
                slack_message += (
                    f"  *Campaign: {campaign_name} (Should not have been spending)*\n"
                    f"    • Spend: ${spend:.2f}\n"
                )
                account_spends.append({
                    "name": campaign_name,
                    "spend": spend,
                    "should_not_be_spending": True
                })
        
        if send_slack:
            send_slack_message(slack_message)
        return account_spends
    except Exception as e:
        return {"error": str(e)}
