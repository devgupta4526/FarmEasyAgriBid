'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowDownRight, ArrowUpRight, Building2 } from 'lucide-react';

export default function FarmerEarningsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-agri-600" />
            Earnings & Payouts
          </h1>
          <p className="text-muted-foreground text-sm">
            View available balance, request bank transfers, and audit transaction records
          </p>
        </div>
        <Button className="bg-agri-600 hover:bg-agri-700">
          <Building2 className="h-4 w-4 mr-2" /> Request Payout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-agri-600 to-agri-700 text-white">
          <CardContent className="p-6">
            <p className="text-xs text-agri-100 font-medium">Available Balance</p>
            <h2 className="text-3xl font-extrabold mt-1">$3,840.00</h2>
            <p className="text-xs text-agri-200 mt-4">Ready for instant bank transfer</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium">Pending Escrow Funds</p>
            <h2 className="text-3xl font-extrabold mt-1 text-amber-600">$1,450.00</h2>
            <p className="text-xs text-muted-foreground mt-4">Locked pending customer delivery</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium">Total Lifetime Payouts</p>
            <h2 className="text-3xl font-extrabold mt-1">$12,400.00</h2>
            <p className="text-xs text-muted-foreground mt-4">Transferred to bank account</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-base mb-4">Recent Financial Transactions</h3>
          <div className="divide-y">
            {[
              { id: 'tx-1', type: 'order_payout', title: 'Payment for Order #ORD-103', amount: 1100, date: '2026-07-25', status: 'completed' },
              { id: 'tx-2', type: 'payout_withdrawal', title: 'Bank Withdrawal to HDFC ****4921', amount: -2500, date: '2026-07-20', status: 'completed' },
            ].map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${tx.amount > 0 ? 'bg-agri-100 text-agri-700' : 'bg-muted text-foreground'}`}>
                    {tx.amount > 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? 'text-agri-700 dark:text-agri-400' : ''}`}>
                  {tx.amount > 0 ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
