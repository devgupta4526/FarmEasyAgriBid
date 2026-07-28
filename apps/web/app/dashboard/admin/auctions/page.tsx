'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminAuctionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-agri-600" />
          Auction Governance & Moderation
        </h1>
        <p className="text-muted-foreground text-sm">
          Monitor live bidding rooms, inspect bid logs, and trigger emergency auction pause
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {[
            { id: 'auc-101', title: 'Premium Organic Wheat (100 Quintals)', bids: 18, highBid: 450, status: 'active' },
            { id: 'auc-102', title: 'Mustard Seed Harvest', bids: 24, highBid: 280, status: 'ended' },
          ].map((auc) => (
            <div key={auc.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{auc.title}</h3>
                  <Badge variant={auc.status === 'active' ? 'default' : 'secondary'}>{auc.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Bids: {auc.bids} • Highest: ${auc.highBid}</p>
              </div>
              {auc.status === 'active' && (
                <Button size="sm" variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" /> Pause Auction
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
