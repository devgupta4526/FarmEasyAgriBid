'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-agri-600" />
          Global Platform Orders
        </h1>
        <p className="text-muted-foreground text-sm">
          Monitor transaction volume, fulfillment status, and escrow releases across all regions
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {[
            { id: 'ORD-901', crop: 'Organic Wheat', amount: 4500, buyer: 'AgriCorp', status: 'shipped' },
            { id: 'ORD-902', crop: 'Basmati Rice', amount: 2200, buyer: 'Metro Foods', status: 'delivered' },
          ].map((ord) => (
            <div key={ord.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{ord.id}</span>
                  <h3 className="font-semibold text-sm">{ord.crop}</h3>
                  <Badge className="capitalize">{ord.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Buyer: {ord.buyer}</p>
              </div>
              <span className="font-bold text-sm">${ord.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
