'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { productApi, categoryApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowLeft, Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    listing_type: 'instant_buy',
    base_price: '',
    buy_now_price: '',
    quantity_available: '',
    quantity_unit: 'kg',
    quality_grade: 'A',
    is_organic: false,
    location_text: '',
    state: '',
    district: '',
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list() as Promise<{ categories: Category[] }>,
  });

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
    if (!accessToken) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }
    if (!form.category_id) {
      toast({ title: 'Please select a category', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        listing_type: form.listing_type,
        base_price: form.base_price ? parseFloat(form.base_price) : undefined,
        buy_now_price: form.buy_now_price ? parseFloat(form.buy_now_price) : undefined,
        quantity_available: parseFloat(form.quantity_available),
        quantity_unit: form.quantity_unit,
        quality_grade: form.quality_grade,
        is_organic: form.is_organic,
        location_text: form.location_text,
        state: form.state,
        district: form.district,
      };

      await productApi.create(payload, accessToken);
      toast({ title: 'Product Created Successfully!' });
      router.push('/dashboard/farmer/products');
    } catch (err) {
      toast({
        title: 'Failed to create product',
        description: (err as Error).message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            <Package className="h-6 w-6 text-agri-600" /> Create New Product Listing
          </h1>
          <p className="text-muted-foreground text-sm">List your agricultural produce on the marketplace</p>
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
                placeholder="e.g. Premium Organic Alphonso Mangoes (100 Kg)"
                className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Category *</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesData?.categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Listing Type *</label>
                <select
                  name="listing_type"
                  value={form.listing_type}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="instant_buy">Instant Buy</option>
                  <option value="auction">Auction</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Base / Starting Price (₹)</label>
                <input
                  type="number"
                  name="base_price"
                  value={form.base_price}
                  onChange={handleChange}
                  placeholder="e.g. 50"
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
                  placeholder="e.g. 70"
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity Available *</label>
                <input
                  type="number"
                  name="quantity_available"
                  value={form.quantity_available}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Unit *</label>
                <select
                  name="quantity_unit"
                  value={form.quantity_unit}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="quintal">quintal</option>
                  <option value="piece">piece</option>
                  <option value="dozen">dozen</option>
                  <option value="litre">litre</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Quality Grade</label>
                <select
                  name="quality_grade"
                  value={form.quality_grade}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="A+">Grade A+</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">District / Location</label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="e.g. Ratnagiri"
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Provide details about harvest date, storage condition, and quality..."
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
                <Plus className="h-4 w-4 mr-2" /> {submitting ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
