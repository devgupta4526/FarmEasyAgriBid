'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import {
  Package, TrendingUp, DollarSign, ShoppingBag, Bell, Plus,
  BarChart3, Leaf, Star, Users, ArrowUpRight, Eye
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const revenueData = [
  { month: 'Jul', revenue: 12400, orders: 8 },
  { month: 'Aug', revenue: 18600, orders: 14 },
  { month: 'Sep', revenue: 15200, orders: 11 },
  { month: 'Oct', revenue: 24100, orders: 19 },
  { month: 'Nov', revenue: 28900, orders: 23 },
  { month: 'Dec', revenue: 35200, orders: 31 },
];

const productPerf = [
  { name: 'Red Onions', sales: 120, revenue: 2400 },
  { name: 'Tomatoes', sales: 90, revenue: 1800 },
  { name: 'Grapes', sales: 45, revenue: 6750 },
  { name: 'Mangoes', sales: 30, revenue: 9000 },
  { name: 'Pomegranate', sales: 25, revenue: 5000 },
];

const statCards = [
  { label: 'Total Revenue', value: '₹1,34,400', change: '+24%', icon: DollarSign, color: 'text-agri-600', bg: 'bg-agri-50 dark:bg-agri-900/20' },
  { label: 'Active Listings', value: '12', change: '+3', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Total Orders', value: '106', change: '+18%', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Avg Rating', value: '4.8', change: '+0.2', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
];

export default function FarmerDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Good morning, {user?.full_name?.split(' ')[0] ?? 'Farmer'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening on your farm today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/farmer/products/new">
            <Button className="bg-agri-600 hover:bg-agri-700 gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1.5">{stat.value}</p>
                    <Badge
                      variant="secondary"
                      className="mt-2 text-xs font-medium text-agri-700 bg-agri-100 dark:bg-agri-900/30 dark:text-agri-300"
                    >
                      {stat.change}
                    </Badge>
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

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            <Badge variant="outline" className="text-xs">Last 6 Months</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productPerf} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" tickFormatter={(v) => `${v}`} />
                <YAxis type="category" dataKey="name" width={80} className="text-xs" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="sales" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <Link href="/dashboard/farmer/orders">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'ORD-001', product: 'Red Onions 100kg', buyer: 'Priya S.', amount: '₹1,800', status: 'delivered' },
                { id: 'ORD-002', product: 'Organic Mangoes 20kg', buyer: 'Suresh K.', amount: '₹4,200', status: 'in_transit' },
                { id: 'ORD-003', product: 'Tomatoes 50kg', buyer: 'Anita M.', amount: '₹1,100', status: 'confirmed' },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{order.product}</p>
                    <p className="text-xs text-muted-foreground">{order.buyer} · {order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{order.amount}</p>
                    <Badge
                      variant="secondary"
                      className={`text-xs mt-0.5 ${
                        order.status === 'delivered' ? 'bg-agri-100 text-agri-700' :
                        order.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">My Products</CardTitle>
            <Link href="/dashboard/farmer/products">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Manage <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Premium Nashik Red Onions', qty: '400 kg', views: 234, status: 'active', organic: false },
                { name: 'Organic Alphonso Mangoes', qty: '80 kg', views: 567, status: 'auction', organic: true },
                { name: 'Fresh Tomatoes Grade A', qty: '200 kg', views: 123, status: 'active', organic: false },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-agri-100 dark:bg-agri-900/30 flex items-center justify-center text-lg">
                      {p.organic ? '🌿' : '🥦'}
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">{p.qty} left</p>
                        <span className="text-muted-foreground/50">·</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />{p.views}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={p.status === 'auction'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-agri-100 text-agri-700 dark:bg-agri-900/30 dark:text-agri-400'
                    }
                  >
                    {p.status === 'auction' ? '🔴 Live' : 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
