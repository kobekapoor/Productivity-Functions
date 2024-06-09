import os
from fastapi import FastAPI
import requests
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = FastAPI()

# Facebook API credentials from environment variables
ACCESS_TOKEN = os.getenv('FACEBOOK_ACCESS_TOKEN')
AD_ACCOUNT_ID = os.getenv('FACEBOOK_AD_ACCOUNT_ID')

def get_campaign_spend(ad_account_id, access_token):
    url = f"https://graph.facebook.com/v17.0/act_{ad_account_id}/insights"
    params = {
        'fields': 'spend',
        'date_preset': 'today',
        'access_token': access_token
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    total_spend = sum(float(insight['spend']) for insight in data['data'])
    return total_spend

@app.get("/api/facebook/spend")
def facebook_ad_spend():
    try:
        spend = get_campaign_spend(AD_ACCOUNT_ID, ACCESS_TOKEN)
        return {"spend": spend}
    except Exception as e:
        return {"error": str(e)}