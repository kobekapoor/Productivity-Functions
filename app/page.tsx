"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';


interface CampaignDetails {
  name: string;
  start_date: string;
  end_date: string;
  set_budget: number;
  daily_budget: number;
  spend: number;
  expected_spend: number;
  offset_amount: number;
  on_track: boolean;
  suggested_daily_budget: number;
  should_not_be_spending?: boolean;
}

interface Account {
  account_name: string;
  campaigns?: CampaignDetails[];
  name?: string;
  spend?: number;
  should_not_be_spending?: boolean;
}

const HomePage = () => {
  const [data, setData] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = (sendSlack: boolean = false) => {
    const url = sendSlack ? '/api/facebook/spend?send_slack=true' : '/api/facebook/spend';
    fetch(url)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => setError(error.message));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Facebook Ads Spend Report</h1>
      <Button onClick={() => fetchData(true)}>Fetch Data and Send Slack Message</Button>
      {data.map((item, index) => (
        <div key={index} className="my-4">
          {item.account_name ? (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Account: {item.account_name}</h2>
              </CardHeader>
              <CardContent>
                {item.campaigns?.map((campaign) => (
                  <div key={campaign.name} className="mb-4">
                    <h3 className="text-lg font-medium">Campaign: {campaign.name}</h3>
                    <ul>
                      <li>Start Date: {campaign.start_date}</li>
                      <li>End Date: {campaign.end_date}</li>
                      <li>Set Budget: ${campaign.set_budget.toFixed(2)}</li>
                      <li>Daily Budget: ${campaign.daily_budget.toFixed(2)}</li>
                      <li>Spend: ${campaign.spend.toFixed(2)}</li>
                      <li>Expected Spend: ${campaign.expected_spend.toFixed(2)}</li>
                      <li>Offset Amount: ${campaign.offset_amount.toFixed(2)}</li>
                      <li>On Track: {campaign.on_track ? 'Yes' : 'No'}</li>
                      <li>Suggested Daily Budget: ${campaign.suggested_daily_budget.toFixed(2)}</li>
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Campaign: {item.name}</h2>
              </CardHeader>
              <CardContent>
                <ul>
                  <li>Spend: ${item.spend?.toFixed(2)}</li>
                  {item.should_not_be_spending && <li style={{ color: 'red' }}>Should not be spending!</li>}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
};

export default HomePage;
