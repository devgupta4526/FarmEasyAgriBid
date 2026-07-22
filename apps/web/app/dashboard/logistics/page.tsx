'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import {
  Truck, MapPin, Clock, Star, DollarSign, CheckCircle, Package, Navigation
} from 'lucide-react';

const mockDeliveries = [
  { id: '1', order_number: 'ORD-20241201-abc', product: 'Organic Mangoes 20kg', buyer: 'Priya Sharma', status: 'picked_up', amount: 350, pickup: 'Nashik', delivery: 'Mumbai', distance: 172 },
  { id: '2', order_number: 'ORD-20241201-def', product: 'Red Onions 100kg', buyer: 'Suresh Kumar', status: 'in_transit', amount: 1800, pickup: 'Nashik', delivery: 'Pune', distance: 218 },
  { id: '3', order_number: 'ORD-20241130-ghi', product: 'Tomatoes 50kg', buyer: 'Anita Mehta', status: 'delivered', amount: 1100, pickup: 'Nashik', delivery: 'Thane', distance: 180 },
];

const statusBadge: Record<string, { className: string; label: string }> = {
  pending: { className: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
  accepted: { className: 'bg-blue-100 text-blue-700', label: 'Accepted' },
  picked_up: { className: 'bg-purple-100 text-purple-700', label: 'Picked Up' },
  in_transit: { className: 'bg-orange-100 text-orange-700', label: 'In Transit' },
  delivered: { className: 'bg-agri-100 text-agri-700', label: 'Delivered' },
};

export default function LogisticsDashboard() {
  const { user } = useAuthStore();

  const activeDeliveries = mockDeliveries.filter((d) => d.status !== 'delivered');
  const completed = mockDeliveries.filter((d) => d.status === 'delivered');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your pickups and deliveries</p>
        </div>
        <Badge className="bg-agri-100 text-agri-700 dark:bg-agri-900/30 dark:text-agri-300 gap-1.5">
          <span className="h-2 w-2 rounded-full bg-agri-600 animate-pulse" />
          Available
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Deliveries', value: '147', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'This Month', value: '23', icon: CheckCircle, color: 'text-agri-600', bg: 'bg-agri-50 dark:bg-agri-900/20' },
          { label: 'Total Earned', value: '₹18,400', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Avg Rating', value: '4.7 ⭐', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1.5">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Deliveries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-500" />
            Active Deliveries ({activeDeliveries.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeDeliveries.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No active deliveries.</p>
            </div>
          ) : (
            activeDeliveries.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-sm">{d.product}</p>
                      <Badge className={`text-xs ${statusBadge[d.status]?.className}`}>
                        {statusBadge[d.status]?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Buyer: {d.buyer} · {d.order_number}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{d.pickup} → {d.delivery}</span>
                      <span>({d.distance}km)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-agri-600">₹{d.amount}</p>
                    <Link href={`/dashboard/logistics/deliveries/${d.id}`}>
                      <Button size="sm" className="mt-2 h-7 text-xs bg-agri-600 hover:bg-agri-700">
                        Update
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Completed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-agri-600" />
            Recently Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {completed.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
              <div>
                <p className="text-sm font-medium">{d.product}</p>
                <p className="text-xs text-muted-foreground">{d.pickup} → {d.delivery} · {d.distance}km</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">₹{d.amount}</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  {[1,2,3,4,5].map((s) => <span key={s} className="text-yellow-400 text-xs">★</span>)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
