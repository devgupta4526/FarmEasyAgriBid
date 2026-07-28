'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';

export default function BuyerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-agri-600" />
          Buyer Expense & Procurement Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Track procurement budgets, category expenses, and savings via auction bidding
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 rounded-xl text-agri-700 dark:text-agri-300">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Procurement Spend</p>
              <p className="text-2xl font-bold">$18,450</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-700 dark:text-blue-300">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Crops Procured</p>
              <p className="text-2xl font-bold">124 Tons</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-700 dark:text-amber-300">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Auction Savings</p>
              <p className="text-2xl font-bold">14.2% Saved</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
