// app/api/clients/route.js
import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        facebookAccounts: {
          select: {
            accountId: true,
            campaigns: {
              select: {
                id: true,
                name: true,
                budgets: {
                  select: {
                    id: true,
                    amount: true,
                    startDate: true,
                    endDate: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
