'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, PlusCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function BuyerWalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-agri-600" />
            Digital Wallet & Escrow Balance
          </h1>
          <p className="text-muted-foreground text-sm">
            Deposit funds, track escrow holds for active auction bids, and view payment logs
          </p>
        </div>
        <Button className="bg-agri-600 hover:bg-agri-700">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Funds
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-agri-600 to-agri-700 text-white">
          <CardContent className="p-6">
            <p className="text-xs text-agri-100 font-medium">Available Cash Balance</p>
            <h2 className="text-3xl font-extrabold mt-1">$5,200.00</h2>
            <p className="text-xs text-agri-200 mt-4">Available for direct purchases & bids</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium">Locked Escrow Hold</p>
            <h2 className="text-3xl font-extrabold mt-1 text-amber-600">$1,250.00</h2>
            <p className="text-xs text-muted-foreground mt-4">Held for active auction bids</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium">Total Spend (This Month)</p>
            <h2 className="text-3xl font-extrabold mt-1">$8,940.00</h2>
            <p className="text-xs text-muted-foreground mt-4">Successful crop orders</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-base mb-4">Transaction History</h3>
          <div className="divide-y">
            {[
              { id: 'tx-1', title: 'Wallet Top-Up (Credit Card)', amount: 2000, date: '2026-07-24', type: 'deposit' },
              { id: 'tx-2', title: 'Escrow Lock for Auction #104', amount: -420, date: '2026-07-25', type: 'escrow' },
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
