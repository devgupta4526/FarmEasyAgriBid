'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-agri-600" />
          Platform System Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Platform-wide GMV growth, user registration metrics, and regional trade distribution
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 rounded-xl text-agri-700">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Platform GMV</p>
              <p className="text-2xl font-bold">$148,500</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Registered Accounts</p>
              <p className="text-2xl font-bold">1,240 Users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">MoM Trade Growth</p>
              <p className="text-2xl font-bold">+24.8%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
