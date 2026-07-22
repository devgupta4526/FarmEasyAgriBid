'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { orderApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingBag, TrendingUp, Wallet, Heart, MapPin, Bell, Star,
  Search, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const spendData = [
  { month: 'Jul', spend: 4200 }, { month: 'Aug', spend: 6800 },
  { month: 'Sep', spend: 3100 }, { month: 'Oct', spend: 9200 },
  { month: 'Nov', spend: 7400 }, { month: 'Dec', spend: 11500 },
];

export default function BuyerDashboard() {
  const { user, accessToken } = useAuthStore();

  const { data: ordersData } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => orderApi.list({ limit: '5' }, accessToken!) as Promise<{ orders: Array<{ id: string; order_number: string; product_title: string; product_image?: string; total_amount: number; status: string; created_at: string }> }>,
    enabled: !!accessToken,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Discover fresh produce directly from farmers.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/marketplace">
            <Button className="bg-agri-600 hover:bg-agri-700 gap-2">
              <Search className="h-4 w-4" /> Browse Market
            </Button>
          </Link>
          <Link href="/auctions">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Live Auctions
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: '24', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Spent', value: '₹42,200', icon: Wallet, color: 'text-agri-600', bg: 'bg-agri-50 dark:bg-agri-900/20' },
          { label: 'Active Bids', value: '3', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Wishlist', value: '12', icon: Heart, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
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

      {/* Charts & Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spendData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Spent']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" fill="url(#spendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: '/auctions', label: 'Live Auctions', icon: TrendingUp, badge: '3 live' },
              { href: '/dashboard/buyer/wishlist', label: 'My Wishlist', icon: Heart },
              { href: '/map', label: 'Nearby Farms', icon: MapPin },
              { href: '/dashboard/buyer/orders', label: 'My Orders', icon: ShoppingBag },
              { href: '/ai', label: 'AI Price Advisor', icon: Star, badge: 'AI' },
            ].map((a) => (
              <Link key={a.href} href={a.href}>
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2.5 text-sm">
                    <a.icon className="h-4 w-4 text-muted-foreground" />
                    {a.label}
                  </div>
                  {a.badge && <Badge variant="secondary" className="text-xs">{a.badge}</Badge>}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Link href="/dashboard/buyer/orders">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!ordersData?.orders?.length ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No orders yet.</p>
              <Link href="/marketplace">
                <Button className="mt-4 bg-agri-600 hover:bg-agri-700" size="sm">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ordersData.orders.map((order) => (
                <Link key={order.id} href={`/dashboard/buyer/orders/${order.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-agri-100 dark:bg-agri-900/30 flex items-center justify-center text-lg">🌾</div>
                      <div>
                        <p className="text-sm font-medium">{order.product_title}</p>
                        <p className="text-xs text-muted-foreground">{order.order_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(order.total_amount)}</p>
                      <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
