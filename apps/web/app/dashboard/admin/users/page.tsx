'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, ShieldOff, ShieldCheck, Ban, Filter } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  last_login_at?: string;
  farmer_kyc_status?: string;
  buyer_kyc_status?: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-agri-100 text-agri-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-orange-100 text-orange-700',
  banned: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (roleFilter) params.role = roleFilter;
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminApi.users(params, accessToken!) as Promise<{ users: User[]; pagination: { total: number } }>,
    enabled: !!accessToken,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateUserStatus(id, status, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User status updated' });
    },
    onError: (err) => toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-agri-600" /> User Management
        </h1>
        <span className="text-sm text-muted-foreground">{data?.pagination?.total ?? 0} total users</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border bg-background text-sm"
        >
          <option value="">All Roles</option>
          <option value="farmer">Farmers</option>
          <option value="buyer">Buyers</option>
          <option value="logistics">Logistics</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border bg-background text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">KYC</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4"><div className="skeleton h-8 w-48 rounded" /></td>
                    <td className="p-4"><div className="skeleton h-6 w-16 rounded" /></td>
                    <td className="p-4"><div className="skeleton h-6 w-16 rounded" /></td>
                    <td className="p-4"><div className="skeleton h-6 w-16 rounded" /></td>
                    <td className="p-4"><div className="skeleton h-6 w-24 rounded" /></td>
                    <td className="p-4"><div className="skeleton h-8 w-24 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : !data?.users?.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">No users found</td>
                </tr>
              ) : (
                data.users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-agri-100 dark:bg-agri-900/30 flex items-center justify-center text-xs font-bold text-agri-700">
                          {u.full_name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{u.full_name}</p>
                          <p className="text-xs text-muted-foreground">{u.email || u.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="capitalize text-xs">{u.role}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-xs ${statusColors[u.status] || ''}`}>{u.status}</Badge>
                    </td>
                    <td className="p-4">
                      {(u.farmer_kyc_status || u.buyer_kyc_status) && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {u.farmer_kyc_status || u.buyer_kyc_status}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-orange-600 border-orange-200 h-7 text-xs"
                            onClick={() => statusMutation.mutate({ id: u.id, status: 'suspended' })}
                            disabled={statusMutation.isPending}
                          >
                            <ShieldOff className="h-3 w-3" /> Suspend
                          </Button>
                        ) : u.status === 'suspended' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-agri-600 border-agri-200 h-7 text-xs"
                            onClick={() => statusMutation.mutate({ id: u.id, status: 'active' })}
                            disabled={statusMutation.isPending}
                          >
                            <ShieldCheck className="h-3 w-3" /> Activate
                          </Button>
                        ) : null}
                        {u.status !== 'banned' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-destructive h-7 text-xs"
                            onClick={() => statusMutation.mutate({ id: u.id, status: 'banned' })}
                            disabled={statusMutation.isPending}
                          >
                            <Ban className="h-3 w-3" /> Ban
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
