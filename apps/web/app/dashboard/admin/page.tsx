'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  Users, Package, ShoppingBag, DollarSign, TrendingUp, Shield,
  Bell, Eye, UserCheck, AlertTriangle, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(accessToken!) as Promise<{
      stats: {
        users: { total: string; farmers: string; buyers: string; pending: string };
        products: { total: string; active: string; sold: string };
        orders: { total: string; pending: string; delivered: string };
        revenue: { total_revenue: string; monthly_revenue: string };
        auctions: { live: string; scheduled: string };
      };
      monthly_trend: { month: string; orders: string; revenue: string }[];
    }>,
    enabled: !!accessToken,
  });

  const stats = data?.stats;
  const trend = data?.monthly_trend || [];

  const statCards = [
    {
      label: 'Total Users', value: formatNumber(parseInt(stats?.users?.total || '0')),
      sub: `${stats?.users?.pending || 0} pending`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Total Revenue', value: formatCurrency(parseFloat(stats?.revenue?.total_revenue || '0')),
      sub: `${formatCurrency(parseFloat(stats?.revenue?.monthly_revenue || '0'))} this month`, icon: DollarSign, color: 'text-agri-600', bg: 'bg-agri-50 dark:bg-agri-900/20'
    },
    {
      label: 'Active Products', value: formatNumber(parseInt(stats?.products?.active || '0')),
      sub: `${stats?.products?.sold || 0} sold`, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Total Orders', value: formatNumber(parseInt(stats?.orders?.total || '0')),
      sub: `${stats?.orders?.pending || 0} pending`, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      label: 'Live Auctions', value: stats?.auctions?.live || '0',
      sub: `${stats?.auctions?.scheduled || 0} scheduled`, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20'
    },
  ];

  const userPieData = stats ? [
    { name: 'Farmers', value: parseInt(stats.users.farmers), color: '#16a34a' },
    { name: 'Buyers', value: parseInt(stats.users.buyers), color: '#3b82f6' },
    { name: 'Other', value: parseInt(stats.users.total) - parseInt(stats.users.farmers) - parseInt(stats.users.buyers), color: '#8b5cf6' },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/admin/kyc">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              KYC Review
              {parseInt(stats?.users?.pending || '0') > 0 && (
                <Badge className="bg-red-500 text-white text-xs">{stats?.users?.pending}</Badge>
              )}
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" /> Broadcast
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{isLoading ? <span className="skeleton h-7 w-16 block rounded" /> : stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue & Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    name === 'revenue' ? `₹${v.toLocaleString()}` : v,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#revGrad2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={userPieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {userPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users, badge: stats?.users?.pending, badgeColor: 'bg-red-500' },
          { href: '/dashboard/admin/kyc', label: 'Review KYC', icon: Shield, badge: null },
          { href: '/dashboard/admin/products', label: 'Moderate Products', icon: Package, badge: null },
          { href: '/dashboard/admin/audit-logs', label: 'Audit Logs', icon: Eye, badge: null },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
                {action.badge && parseInt(String(action.badge)) > 0 && (
                  <Badge className={`${action.badgeColor} text-white text-xs`}>{action.badge}</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
