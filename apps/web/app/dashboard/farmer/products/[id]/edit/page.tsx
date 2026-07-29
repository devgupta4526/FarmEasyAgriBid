'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { productApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowLeft, Check } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    base_price: '',
    buy_now_price: '',
    quantity_available: '',
    status: 'active',
    is_organic: false,
    quality_grade: 'A',
  });

  useEffect(() => {
    if (!id || !accessToken) return;
    setLoading(true);
    productApi.get(id, accessToken)
      .then((res: any) => {
        const p = res?.product || res;
        if (p) {
          setForm({
            title: p.title || '',
            description: p.description || '',
            base_price: p.base_price ? String(p.base_price) : '',
            buy_now_price: p.buy_now_price ? String(p.buy_now_price) : '',
            quantity_available: p.quantity_available ? String(p.quantity_available) : '',
            status: p.status || 'active',
            is_organic: !!p.is_organic,
            quality_grade: p.quality_grade || 'A',
          });
        }
      })
      .catch((err) => {
        toast({ title: 'Error loading product', description: err.message, variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [id, accessToken, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !id) return;

    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        base_price: form.base_price ? parseFloat(form.base_price) : undefined,
        buy_now_price: form.buy_now_price ? parseFloat(form.buy_now_price) : undefined,
        quantity_available: form.quantity_available ? parseFloat(form.quantity_available) : undefined,
        status: form.status,
        is_organic: form.is_organic,
        quality_grade: form.quality_grade,
      };

      await productApi.update(id, payload, accessToken);
      toast({ title: 'Product Updated Successfully!' });
      router.push('/dashboard/farmer/products');
    } catch (err) {
      toast({
        title: 'Failed to update product',
        description: (err as Error).message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/farmer/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-600" /> Edit Product Listing
          </h1>
          <p className="text-muted-foreground text-sm">Update prices, stock levels, or status for this listing</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Base / Starting Price (₹)</label>
                <input
                  type="number"
                  name="base_price"
                  value={form.base_price}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Buy Now Price (₹)</label>
                <input
                  type="number"
                  name="buy_now_price"
                  value={form.buy_now_price}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity Available *</label>
                <input
                  type="number"
                  name="quantity_available"
                  value={form.quantity_available}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Listing Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="sold">Sold</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-3 h-24 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_organic"
                name="is_organic"
                checked={form.is_organic}
                onChange={handleChange}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="is_organic" className="text-sm font-medium cursor-pointer">
                🌿 Organic Certified Produce
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Link href="/dashboard/farmer/products">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" className="bg-agri-600 hover:bg-agri-700" disabled={submitting}>
                <Check className="h-4 w-4 mr-2" /> {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
