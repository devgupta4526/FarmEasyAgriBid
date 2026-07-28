'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { logisticsApi } from '@/lib/api';
import { Truck, MapPin, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Delivery {
  id: string;
  order_number?: string;
  product_title?: string;
  buyer_name?: string;
  status: string;
  created_at: string;
}

export default function LogisticsDeliveriesPage() {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchDeliveries();
  }, [accessToken]);

  const fetchDeliveries = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await logisticsApi.deliveries({}, accessToken) as { deliveries?: Delivery[] };
      setDeliveries(res.deliveries || []);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (!accessToken) return;
    try {
      await logisticsApi.updateStatus(id, newStatus, undefined, accessToken);
      toast({ title: `Delivery status updated to ${newStatus}` });
      fetchDeliveries();
    } catch (err) {
      toast({ title: 'Status update failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

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
        <CardContent className="p-6">
          {deliveries.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <Package className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold">No assigned deliveries yet</p>
              <p className="text-xs">When orders are assigned to your logistics vehicle, they will appear here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {deliveries.map((del) => (
                <div key={del.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">#{del.order_number || del.id}</span>
                      <h3 className="font-semibold text-base">{del.product_title || 'Agricultural Freight'}</h3>
                      <Badge variant={del.status === 'in_transit' ? 'default' : 'secondary'} className={del.status === 'in_transit' ? 'bg-agri-600' : ''}>
                        {del.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recipient: {del.buyer_name || 'Customer'} • Assigned: {new Date(del.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {del.status === 'accepted' && (
                      <Button size="sm" className="bg-agri-600 hover:bg-agri-700" onClick={() => updateStatus(del.id, 'picked_up')}>
                        Mark Picked Up
                      </Button>
                    )}
                    {del.status === 'picked_up' && (
                      <Button size="sm" className="bg-agri-600 hover:bg-agri-700" onClick={() => updateStatus(del.id, 'in_transit')}>
                        Start Transit
                      </Button>
                    )}
                    {del.status === 'in_transit' && (
                      <Button size="sm" className="bg-agri-600 hover:bg-agri-700" onClick={() => updateStatus(del.id, 'delivered')}>
                        Mark Delivered
                      </Button>
                    )}
                    <Link href="/map">
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-2 text-agri-600" /> GPS Map
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
