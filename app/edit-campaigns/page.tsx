"use client";

import { useState, useEffect } from 'react';

interface Campaign {
  name: string;
  start_date: string;
  end_date: string;
  set_budget: number;
}

interface Account {
  name: string;
  id: string;
  accountId: string;
  campaigns: Campaign[];
}

const EditCampaignsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/campaigns')
      .then((response) => response.json())
      .then((data) => setAccounts(data))
      .catch((error) => setError(error.message));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    accountIndex: number,
    campaignIndex: number | null,
    field: string
  ) => {
    const newAccounts = [...accounts];
    if (campaignIndex !== null) {
      // Handle campaign field change
      if (field === 'set_budget') {
        newAccounts[accountIndex].campaigns[campaignIndex] = {
          ...newAccounts[accountIndex].campaigns[campaignIndex],
          [field]: parseFloat(e.target.value),
        };
      } else {
        newAccounts[accountIndex].campaigns[campaignIndex] = {
          ...newAccounts[accountIndex].campaigns[campaignIndex],
          [field]: e.target.value,
        };
      }
    } else {
      // Handle account field change
      newAccounts[accountIndex] = {
        ...newAccounts[accountIndex],
        [field]: e.target.value,
      };
    }
    setAccounts(newAccounts);
  };

  const handleAddAccount = () => {
    const newAccount: Account = {
      name: '',
      id: Date.now().toString(),
      accountId: '',
      campaigns: [],
    };
    setAccounts([...accounts, newAccount]);
  };

  const handleDeleteAccount = (index: number) => {
    const newAccounts = accounts.filter((_, accountIndex) => accountIndex !== index);
    setAccounts(newAccounts);
  };

  const handleAddCampaign = (accountIndex: number) => {
    const newCampaign: Campaign = {
      name: '',
      start_date: '',
      end_date: '',
      set_budget: 0,
    };
    const newAccounts = [...accounts];
    newAccounts[accountIndex].campaigns.push(newCampaign);
    setAccounts(newAccounts);
  };

  const handleDeleteCampaign = (accountIndex: number, campaignIndex: number) => {
    const newAccounts = [...accounts];
    newAccounts[accountIndex].campaigns = newAccounts[accountIndex].campaigns.filter((_, index) => index !== campaignIndex);
    setAccounts(newAccounts);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("Saving data:", accounts); // Log the data being sent
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accounts),
      });
      if (!response.ok) {
        throw new Error('Failed to update campaigns.json');
      }
      alert('Campaigns updated successfully');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Campaigns</h1>
      <button
        onClick={handleAddAccount}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Add Account
      </button>
      {accounts.map((account, accountIndex) => (
        <div key={account.id} className="mb-4 border p-4 rounded shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Account: 
              <input
                type="text"
                value={account.name}
                onChange={(e) => handleInputChange(e, accountIndex, null, 'name')}
                className="ml-2 p-1 border rounded"
              />
              <input
                type="text"
                value={account.accountId}
                onChange={(e) => handleInputChange(e, accountIndex, null, 'accountId')}
                placeholder="Account ID"
                className="ml-2 p-1 border rounded"
              />
              <button
                onClick={() => handleDeleteAccount(accountIndex)}
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                Delete Account
              </button>
            </h2>
          </div>
          {account.campaigns.map((campaign, campaignIndex) => (
            <div key={campaign.name} className="mb-4 p-4 border rounded bg-gray-100">
              <div className="mb-2">
                <label className="block">
                  Name:
                  <input
                    type="text"
                    value={campaign.name}
                    onChange={(e) => handleInputChange(e, accountIndex, campaignIndex, 'name')}
                    className="block w-full mt-1 p-1 border rounded"
                  />
                </label>
              </div>
              <div className="mb-2">
                <label className="block">
                  Start Date:
                  <input
                    type="date"
                    value={campaign.start_date}
                    onChange={(e) => handleInputChange(e, accountIndex, campaignIndex, 'start_date')}
                    className="block w-full mt-1 p-1 border rounded"
                  />
                </label>
              </div>
              <div className="mb-2">
                <label className="block">
                  End Date:
                  <input
                    type="date"
                    value={campaign.end_date}
                    onChange={(e) => handleInputChange(e, accountIndex, campaignIndex, 'end_date')}
                    className="block w-full mt-1 p-1 border rounded"
                  />
                </label>
              </div>
              <div className="mb-2">
                <label className="block">
                  Set Budget:
                  <input
                    type="number"
                    value={campaign.set_budget}
                    onChange={(e) => handleInputChange(e, accountIndex, campaignIndex, 'set_budget')}
                    className="block w-full mt-1 p-1 border rounded"
                  />
                </label>
              </div>
              <button
                onClick={() => handleDeleteCampaign(accountIndex, campaignIndex)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                Delete Campaign
              </button>
            </div>
          ))}
          <button
            onClick={() => handleAddCampaign(accountIndex)}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Add Campaign
          </button>
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`mt-4 px-4 py-2 ${loading ? 'bg-gray-500' : 'bg-blue-500'} text-white rounded hover:bg-blue-700`}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default EditCampaignsPage;
