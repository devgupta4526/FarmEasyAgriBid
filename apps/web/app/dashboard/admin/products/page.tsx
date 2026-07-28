'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const products = [
    { id: 'prd-1', title: 'Organic Wheat (100 Quintals)', farmer: 'Green Valley Organic Farms', status: 'approved', price: 450 },
    { id: 'prd-2', title: 'Fresh Hybrid Tomatoes', farmer: 'Sunnyside Farm', status: 'pending_review', price: 640 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-agri-600" />
          Product Moderation & Approval
        </h1>
        <p className="text-muted-foreground text-sm">
          Review, approve, or flag seller crop listings across the platform
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {products.map((prd) => (
            <div key={prd.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">{prd.title}</h3>
                  <Badge variant={prd.status === 'approved' ? 'default' : 'secondary'}>
                    {prd.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Farmer: {prd.farmer} • Price: ${prd.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-agri-600 hover:bg-agri-700">Approve</Button>
                <Button size="sm" variant="destructive">Flag Listing</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
