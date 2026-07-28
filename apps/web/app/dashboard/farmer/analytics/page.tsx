'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

export default function FarmerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-agri-600" />
          Sales & Earnings Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Track sales growth, auction performance, and monthly revenue metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 rounded-xl text-agri-700 dark:text-agri-300">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Gross Revenue</p>
              <p className="text-2xl font-bold">$14,850</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-700 dark:text-blue-300">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Completed Sales</p>
              <p className="text-2xl font-bold">42 Orders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-700 dark:text-amber-300">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avg Price Premium</p>
              <p className="text-2xl font-bold">+18.5%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6 h-64 flex items-end justify-between gap-4 border-t pt-8">
          {[
            { month: 'Jan', val: 40 },
            { month: 'Feb', val: 65 },
            { month: 'Mar', val: 50 },
            { month: 'Apr', val: 80 },
            { month: 'May', val: 95 },
            { month: 'Jun', val: 70 },
          ].map((bar) => (
            <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                style={{ height: `${bar.val}%` }}
                className="w-full bg-agri-600 rounded-t-xl transition-all duration-500 hover:bg-agri-700"
              />
              <span className="text-xs font-medium text-muted-foreground">{bar.month}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
