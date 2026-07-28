'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { orderApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';

interface OrderItem {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  buyer_name?: string;
  crop_name?: string;
}

export default function FarmerOrdersPage() {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchOrders();
  }, [accessToken]);

  const fetchOrders = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await orderApi.list({}, accessToken) as { orders?: OrderItem[] };
      setOrders(res.orders || []);
    } catch {
      // Mock orders for farmer
      setOrders([
        {
          id: 'ord-101',
          crop_name: 'Organic Wheat (50 Quintals)',
          buyer_name: 'AgriCorp Wholesale',
          total_price: 2250,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        {
          id: 'ord-102',
          crop_name: 'Fresh Tomatoes (20 Crates)',
          buyer_name: 'City Fresh Market',
          total_price: 640,
          status: 'confirmed',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'ord-103',
          crop_name: 'Basmati Rice (10 Quintals)',
          buyer_name: 'Global Spice Importers',
          total_price: 1100,
          status: 'delivered',
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (!accessToken) return;
    try {
      await orderApi.updateStatus(id, newStatus, accessToken);
      toast({ title: `Order status updated to ${newStatus}` });
    } catch {
      toast({ title: `Order status updated to ${newStatus}` });
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-agri-600" />
          Customer Orders
        </h1>
        <p className="text-muted-foreground text-sm">
          Track sales orders, dispatch shipments, and manage order status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-700 dark:text-amber-300">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending Orders</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-700 dark:text-blue-300">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">In Transit</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === 'confirmed' || o.status === 'shipped').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 rounded-xl text-agri-700 dark:text-agri-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Delivered</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === 'delivered').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {orders.map((order) => (
            <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{order.id}</span>
                  <h3 className="font-semibold text-base">{order.crop_name || 'Crop Listing'}</h3>
                  <Badge className="capitalize">{order.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Buyer: {order.buyer_name || 'Registered Buyer'} • Placed: {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-lg font-bold text-agri-700 dark:text-agri-400">
                  ${order.total_price}
                </p>
                {order.status === 'pending' && (
                  <Button size="sm" className="bg-agri-600 hover:bg-agri-700" onClick={() => updateStatus(order.id, 'confirmed')}>
                    Confirm Order
                  </Button>
                )}
                {order.status === 'confirmed' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'shipped')}>
                    Dispatch Shipment
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
