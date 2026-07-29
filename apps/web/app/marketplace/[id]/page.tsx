'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { productApi, wishlistApi, chatApi, orderApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Heart, MapPin, Leaf, Star, ShieldCheck, ShoppingBag, MessageSquare, Clock, Calendar, CheckCircle
} from 'lucide-react';

interface ProductDetail {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  images?: string[];
  listing_type: string;
  base_price?: number;
  buy_now_price?: number;
  quantity_available: number;
  quantity_unit: string;
  quality_grade?: string;
  is_organic?: boolean;
  harvest_date?: string;
  shelf_life_days?: number;
  location_text?: string;
  state?: string;
  district?: string;
  views_count?: number;
  likes_count?: number;
  category_name?: string;
  farmer_id?: string;
  farmer_name?: string;
  farmer_avatar?: string;
  farm_name?: string;
  farmer_rating?: number;
  farmer_verified?: boolean;
  farmer_total_sales?: number;
  auction_id?: string;
  auction_status?: string;
  current_bid?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user, accessToken } = useAuthStore();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi.get(id)
      .then((res: any) => {
        const p = res?.product || res;
        setProduct(p);
      })
      .catch((err) => {
        toast({ title: 'Error loading product', description: err.message, variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleWishlistToggle = async () => {
    if (!user || !accessToken || !product) {
      toast({ title: 'Login Required', description: 'Please login to save products.', variant: 'destructive' });
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
      toast({ title: 'Wishlist Action Failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleBuyNow = async () => {
    if (!user || !accessToken || !product) {
      toast({ title: 'Login Required', description: 'Please login as a buyer to place orders.', variant: 'destructive' });
      return;
    }

    setActionLoading(true);
    try {
      await orderApi.create(
        {
          product_id: product.id,
          quantity: 1,
          total_price: product.buy_now_price || product.base_price || 0,
        },
        accessToken
      );
      toast({ title: 'Order Placed Successfully!', description: 'You can view your order in Buyer Dashboard.' });
      router.push('/dashboard/buyer/orders');
    } catch (err) {
      toast({
        title: 'Checkout Failed',
        description: (err as Error).message || 'Unable to complete order.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user || !accessToken || !product) {
      toast({ title: 'Login Required', description: 'Please login to message sellers.', variant: 'destructive' });
      return;
    }

    try {
      if (product.farmer_id) {
        await chatApi.createRoom({ recipient_id: product.farmer_id, product_id: product.id }, accessToken);
      }
      router.push('/dashboard/chat');
    } catch {
      router.push('/dashboard/chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 text-center text-muted-foreground">
        Loading crop details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background py-24 text-center">
        <div className="text-6xl mb-4">🌾</div>
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested crop listing does not exist or was removed.</p>
        <Link href="/marketplace">
          <Button className="bg-agri-600 hover:bg-agri-700">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const price = product.listing_type === 'auction' && product.current_bid
    ? product.current_bid
    : product.buy_now_price || product.base_price || 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="page-container max-w-5xl space-y-6">
        <Link href="/marketplace">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Marketplace
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {product.thumbnail_url || product.images?.[0] ? (
                  <img
                    src={product.thumbnail_url || product.images?.[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-7xl">🌿</div>
                )}
                <button
                  onClick={handleWishlistToggle}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/70 hover:bg-white transition-colors"
                >
                  <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </button>
              </div>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.category_name && <Badge variant="secondary">{product.category_name}</Badge>}
                {product.is_organic && <Badge className="bg-agri-600 text-white">🌿 Organic Certified</Badge>}
                {product.quality_grade && <Badge variant="outline">Grade {product.quality_grade}</Badge>}
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>

              <div className="flex items-baseline gap-3 my-4">
                <span className="text-3xl font-extrabold text-agri-600">{formatCurrency(price)}</span>
                <span className="text-sm text-muted-foreground">per {product.quantity_unit}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {product.quantity_available} {product.quantity_unit} available
                </Badge>
              </div>
            </div>

            {/* Farmer Card */}
            <Card className="border shadow-none p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-agri-100 dark:bg-agri-900/40 flex items-center justify-center text-lg font-bold text-agri-700">
                    {product.farmer_name?.[0] || 'F'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{product.farmer_name || 'Verified Farmer'}</span>
                      {product.farmer_verified && <ShieldCheck className="h-4 w-4 text-agri-600" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.farm_name || 'Local Farm'}</p>
                  </div>
                </div>
                {product.farmer_rating && (
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.farmer_rating}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-y py-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-agri-600" />
                <span>{product.state || product.location_text || 'India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-agri-600" />
                <span>Shelf Life: {product.shelf_life_days ? `${product.shelf_life_days} days` : 'Fresh'}</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-sm mb-1">Product Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-4 pt-2">
              <Button
                onClick={handleBuyNow}
                disabled={actionLoading}
                className="flex-1 bg-agri-600 hover:bg-agri-700 h-12 text-base font-semibold gap-2"
              >
                <ShoppingBag className="h-5 w-5" /> {actionLoading ? 'Processing...' : 'Buy Now'}
              </Button>
              <Button
                onClick={handleContactSeller}
                variant="outline"
                className="h-12 px-6 gap-2"
              >
                <MessageSquare className="h-5 w-5" /> Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
