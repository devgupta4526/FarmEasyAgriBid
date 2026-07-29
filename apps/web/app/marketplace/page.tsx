'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { productApi, categoryApi, wishlistApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, Heart, Zap, TrendingUp, MapPin, Leaf, Star } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  slug: string;
  thumbnail_url?: string;
  images: string[];
  listing_type: string;
  base_price: number;
  buy_now_price?: number;
  quantity_available: number;
  quantity_unit: string;
  quality_grade: string;
  is_organic: boolean;
  harvest_date?: string;
  shelf_life_days?: number;
  location_text: string;
  state: string;
  views_count: number;
  likes_count: number;
  category_name: string;
  farmer_name: string;
  farmer_avatar?: string;
  farmer_rating?: number;
  farmer_verified?: boolean;
  auction_id?: string;
  auction_status?: string;
  current_bid?: number;
  auction_ends_at?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ProductCard({ product }: { product: Product }) {
  const { user, accessToken } = useAuthStore();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !accessToken) {
      toast({ title: 'Login required', description: 'Please login to save products.', variant: 'destructive' });
      return;
    }

    try {
      if (liked) {
        await wishlistApi.remove(product.id, accessToken);
        setLiked(false);
        toast({ title: 'Removed from wishlist' });
      } else {
        await wishlistApi.add(product.id, accessToken);
        setLiked(true);
        toast({ title: 'Added to wishlist' });
      }
    } catch (err) {
      toast({ title: 'Wishlist update failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const price = product.listing_type === 'auction' && product.current_bid
    ? product.current_bid
    : product.buy_now_price || product.base_price;

  return (
    <motion.div whileHover={{ y: -2 }} className="h-full">
      <Link href={product.auction_id ? `/auctions/${product.auction_id}` : `/marketplace/${product.id}`}>
        <Card className="h-full overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            {product.thumbnail_url || product.images?.[0] ? (
              <img
                src={product.thumbnail_url || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-5xl">🌿</div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {product.is_organic && <Badge className="text-xs bg-agri-600 text-white">🌿 Organic</Badge>}
              {product.auction_status === 'live' && (
                <Badge className="text-xs bg-red-500 text-white animate-pulse">🔴 Live</Badge>
              )}
            </div>

            {/* Like button */}
            <button
              onClick={handleLike}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-black/70 hover:bg-white transition-colors"
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </button>
          </div>

          <CardContent className="p-4">
            <p className="font-semibold text-sm line-clamp-2 mb-2">{product.title}</p>

            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-bold text-agri-600">{formatCurrency(price)}</p>
                <p className="text-xs text-muted-foreground">per {product.quantity_unit}</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-xs">{product.quality_grade}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{product.quantity_available} {product.quantity_unit} left</p>
              </div>
            </div>

            {/* Seller */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>{product.farmer_name}</span>
                {product.farmer_verified && <span className="text-agri-600">✓</span>}
              </div>
              <div className="flex items-center gap-1">
                {product.farmer_rating && (
                  <>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.farmer_rating}</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{product.state}</span>
              </div>
              <div className="flex items-center gap-1">
                {product.listing_type === 'auction' && <TrendingUp className="h-3 w-3 text-orange-500" />}
                {product.buy_now_price && <Zap className="h-3 w-3 text-yellow-500" />}
                <span className="capitalize">{product.listing_type.replace('_', ' ')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isOrganic, setIsOrganic] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list() as Promise<{ categories: Category[] }>,
    staleTime: 10 * 60 * 1000,
  });

  const params: Record<string, string> = { sortBy };
  if (search) params.search = search;
  if (category) params.category = category;
  if (isOrganic) params.isOrganic = 'true';
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;

  const { data, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.list(params) as Promise<{ products: Product[]; pagination: { total: number; pages: number } }>,
    placeholderData: (previousData) => previousData,
  });

  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'views', label: 'Most Popular' },
    { value: 'likes', label: 'Most Liked' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-agri-50 to-background dark:from-agri-950/30 py-8 border-b">
        <div className="page-container">
          <h1 className="text-3xl font-bold mb-4">Marketplace</h1>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vegetables, fruits, grains..."
              className="w-full h-11 pl-9 pr-4 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!category ? 'bg-agri-100 text-agri-700 dark:bg-agri-900/30 dark:text-agri-300 font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  All Categories
                </button>
                {categories?.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-agri-100 text-agri-700 dark:bg-agri-900/30 dark:text-agri-300 font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 className="font-semibold mb-3">Filters</h3>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm flex items-center gap-1.5">
                  <Leaf className="h-4 w-4 text-agri-600" /> Organic Only
                </span>
              </label>

              <div className="space-y-2">
                <p className="text-sm font-medium">Price Range (₹)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full h-9 px-2 rounded-lg border bg-background text-sm"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full h-9 px-2 rounded-lg border bg-background text-sm"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort + Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {data?.pagination?.total ?? 0} products found
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-2xl h-72" />
                ))}
              </div>
            ) : !data?.products?.length ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🌾</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
