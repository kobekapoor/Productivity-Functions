"use client";

import { useEffect, useState } from 'react';
import { prisma } from "@/db";
import React from 'react';



export default function Home() { 
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function fetchClients() {
      const res = await fetch("/api/clients");
      if (!res.ok) {
        throw new Error("Failed to fetch clients");
      }
      const data = await res.json();
      setClients(data);
    }

    fetchClients();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Facebook Ads Spend Report</h1>
      {clients.map((item, index) => (
        <div key={index} className="my-6">
          {item.name ? (
            <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold mb-4">{item.name}</h2>
              </div>
              {item.facebookAccounts?.[0]?.campaigns?.map((campaign) => (
                campaign.budgets.map((budget) => (
                  <div key={campaign.name} className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium">{campaign.name}</h3>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{new Date(budget.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(budget.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-blue-700">Spend Progress</span>
                        {/* <span className="text-sm font-medium text-blue-700">${campaign.budget.result.[0]./spend.toFixed(2)} / ${campaign.set_budget.toFixed(2)}</span> */}
                      </div>
                      <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-blue-500"
                          // style={{ width: `${calculateProgress(campaign.spend, campaign.set_budget)}%` }}
                        ></div>
                        <div
                          className="absolute top-0 left-0 h-full border-l-2 border-red-500"
                          // style={{ left: `${calculateExpectedPoint(campaign.expected_spend, campaign.set_budget)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <table className="w-full text-sm text-left text-gray-500">
                        <tbody>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-gray-700">Set Budget:</th>
                            <td className="px-4 py-2">${budget.amount.toFixed(2)}</td>
                          </tr>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-gray-700">Spend:</th>
                            {/* <td className="px-4 py-2">${budget.results.[0].toFixed(2)}</td> */}
                          </tr>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-gray-700">Expected Spend:</th>
                            {/* <td className="px-4 py-2">${campaign.expected_spend.toFixed(2)}</td> */}
                          </tr>
                        </tbody>
                      </table>
                      <table className="w-full text-sm text-left text-gray-500">
                        <tbody>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-gray-700">Offset Amount:</th>
                            {/* <td className={`px-4 py-2 ${campaign.offset_amount > 0 ? 'text-green-500' : 'text-red-500'}`}>${campaign.offset_amount.toFixed(2)}</td> */}
                          </tr>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-gray-700">On Track:</th>
                            {/* <td className="px-4 py-2">{campaign.on_track ? 'Yes' : 'No'}</td> */}
                          </tr>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-gray-700">Suggested Daily Budget:</th>
                            {/* <td className="px-4 py-2">${campaign.suggested_daily_budget.toFixed(2)}</td> */}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">{item.name}</h2>
              <ul className="list-disc pl-5 space-y-1">
                {/* <li><span className="font-semibold">Spend:</span> ${item.spend?.toFixed(2)}</li>
                {item.should_not_be_spending && <li className="text-red-500 font-semibold">Should not be spending!</li>} */}
              </ul>
            </div>
          )}
        </div>
      ))}
     
    </div>

  );
}
