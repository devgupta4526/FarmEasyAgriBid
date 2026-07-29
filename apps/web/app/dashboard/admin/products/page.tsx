'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ShieldAlert, CheckCircle } from 'lucide-react';
import { productApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  farmer_name?: string;
  status: string;
  base_price?: number;
  buy_now_price?: number;
  quantity_unit?: string;
}

export default function AdminProductsPage() {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productApi.list({ limit: '50' }, accessToken || undefined) as Promise<{ products: Product[] }>,
    enabled: !!accessToken,
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!accessToken) return;
    setUpdatingId(id);
    try {
      await productApi.update(id, { status: newStatus }, accessToken);
      toast({
        title: `Product ${newStatus === 'active' ? 'Approved' : 'Flagged'} Successfully`,
        description: `Product status updated to ${newStatus}.`,
      });
      refetch();
    } catch (err) {
      toast({
        title: 'Action Failed',
        description: (err as Error).message || 'Could not update product status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const products = data?.products || [];

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
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading products for moderation...</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No products available for review.</div>
          ) : (
            products.map((prd) => (
              <div key={prd.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">{prd.title}</h3>
                    <Badge variant={prd.status === 'active' ? 'default' : prd.status === 'draft' || prd.status === 'pending_review' ? 'secondary' : 'destructive'}>
                      {prd.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Farmer: {prd.farmer_name || 'Seller'} • Price: {formatCurrency(prd.buy_now_price || prd.base_price || 0)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-agri-600 hover:bg-agri-700"
                    disabled={updatingId === prd.id || prd.status === 'active'}
                    onClick={() => handleUpdateStatus(prd.id, 'active')}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updatingId === prd.id || prd.status === 'rejected'}
                    onClick={() => handleUpdateStatus(prd.id, 'rejected')}
                  >
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                    Flag Listing
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
