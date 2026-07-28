'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin } from 'lucide-react';

export default function LogisticsDeliveriesPage() {
  const deliveries = [
    { id: 'del-1', order: 'ORD-8821', crop: 'Organic Wheat (50 Quintals)', from: 'Nashik, Maharashtra', to: 'Mumbai Wholesale Market', status: 'in_transit' },
    { id: 'del-2', order: 'ORD-8822', crop: 'Fresh Tomatoes (20 Crates)', from: 'Pune, Maharashtra', to: 'Thane Central Supermarket', status: 'delivered' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6 text-agri-600" />
          Active & Past Deliveries
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage assigned crop shipments, update transit progress, and broadcast live driver GPS coordinates
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {deliveries.map((del) => (
            <div key={del.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{del.order}</span>
                  <h3 className="font-semibold text-base">{del.crop}</h3>
                  <Badge variant={del.status === 'in_transit' ? 'default' : 'secondary'} className={del.status === 'in_transit' ? 'bg-agri-600' : ''}>
                    {del.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pickup: {del.from} → Delivery: {del.to}
                </p>
              </div>

              <Link href="/map">
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2 text-agri-600" /> Broadcast GPS Location
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
