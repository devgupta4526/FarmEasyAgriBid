/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { orderApi, productApi, auctionApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/lib/utils';
import {
  Package, Plus, BarChart3, Upload, TrendingUp, Eye, Edit, Trash2, ArrowUpRight, Filter
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  thumbnail_url?: string;
  status: string;
  listing_type: string;
  base_price?: number;
  buy_now_price?: number;
  quantity_available: number;
  quantity_unit: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  auction_status?: string;
  current_bid?: number;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-agri-100 text-agri-700',
  sold: 'bg-blue-100 text-blue-700',
  expired: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-400',
};

export default function FarmerProductsPage() {
  const { accessToken, user } = useAuthStore();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['farmer-products', user?.id, statusFilter],
    queryFn: () => productApi.list(
      { ...(statusFilter ? { status: statusFilter } : {}), limit: '50' },
      accessToken || undefined
    ) as Promise<{ products: Product[] }>,
    enabled: !!accessToken,
  });

  const handleArchive = async (productId: string) => {
    if (!accessToken) return;
    try {
      await productApi.delete(productId, accessToken);
      toast({ title: 'Product Archived' });
      refetch();
    } catch (err) {
      toast({ title: 'Archive Failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-600" /> My Products
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.products?.length ?? 0} listings
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/farmer/products/new">
            <Button className="bg-agri-600 hover:bg-agri-700 gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {['', 'draft', 'active', 'sold', 'expired', 'archived'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-agri-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
      ) : !data?.products?.length ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-6">Start listing your farm produce to reach thousands of buyers.</p>
          <Link href="/dashboard/farmer/products/new">
            <Button className="bg-agri-600 hover:bg-agri-700 gap-2">
              <Plus className="h-4 w-4" /> Add Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                  {product.thumbnail_url ? (
                    <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">🌿</div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className={`text-xs ${statusColors[product.status] || ''}`}>
                      {product.auction_status === 'live' ? '🔴 Live Auction' : product.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <p className="font-semibold text-sm line-clamp-1 mb-2">{product.title}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-agri-600">
                        {formatCurrency(
                          product.auction_status === 'live' && product.current_bid
                            ? product.current_bid
                            : product.buy_now_price || product.base_price || 0
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">per {product.quantity_unit}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{product.quantity_available} {product.quantity_unit}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{product.views_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <Link href={`/dashboard/farmer/products/${product.id}/edit`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full gap-1 h-8 text-xs">
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                    </Link>
                    <Link href={`/marketplace/${product.id}`} className="flex-1">
                      <Button size="sm" variant="ghost" className="w-full gap-1 h-8 text-xs">
                        <ArrowUpRight className="h-3 w-3" /> View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 px-2"
                      title="Archive Product"
                      onClick={() => handleArchive(product.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
