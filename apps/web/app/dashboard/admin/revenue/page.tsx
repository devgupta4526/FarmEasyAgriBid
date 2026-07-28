'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Percent } from 'lucide-react';

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-agri-600" />
          Platform Revenue & Commission Fees
        </h1>
        <p className="text-muted-foreground text-sm">
          Commission revenue collected from successful auctions and marketplace transactions (2.5% fee)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-agri-600 to-agri-700 text-white">
          <CardContent className="p-6">
            <p className="text-xs text-agri-100 font-medium">Net Commission Collected</p>
            <h2 className="text-3xl font-extrabold mt-1">$3,712.50</h2>
            <p className="text-xs text-agri-200 mt-4">2.5% platform fee on completed orders</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium">Platform Fee Rate</p>
            <h2 className="text-3xl font-extrabold mt-1">2.5%</h2>
            <p className="text-xs text-muted-foreground mt-4">Configured in system environment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
