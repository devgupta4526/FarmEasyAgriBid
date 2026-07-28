'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Truck } from 'lucide-react';

export default function LogisticsEarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-agri-600" />
          Driver Freight Earnings
        </h1>
        <p className="text-muted-foreground text-sm">
          Track transport trip payouts, completed delivery distance, and weekly earnings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-agri-600 to-agri-700 text-white">
          <CardContent className="p-6">
            <p className="text-xs text-agri-100 font-medium">Total Freight Revenue</p>
            <h2 className="text-3xl font-extrabold mt-1">$2,450.00</h2>
            <p className="text-xs text-agri-200 mt-4">Transferred weekly to bank account</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium">Distance Travelled</p>
            <h2 className="text-3xl font-extrabold mt-1">1,840 km</h2>
            <p className="text-xs text-muted-foreground mt-4">Across 28 completed trips</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
