'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { wishlistApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Heart, Trash2, ArrowUpRight } from 'lucide-react';

interface WishlistItem {
  id: string;
  product_id: string;
  title?: string;
  buy_now_price?: number;
  base_price?: number;
  thumbnail_url?: string;
  quantity_available?: number;
  quantity_unit?: string;
}

export default function BuyerWishlistPage() {
  const { accessToken } = useAuthStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchWishlist();
  }, [accessToken]);

  const fetchWishlist = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await wishlistApi.list(accessToken) as { items?: WishlistItem[] };
      setItems(res.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    if (!accessToken) return;
    try {
      await wishlistApi.remove(productId, accessToken);
    } catch {
      // update state
    }
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            My Wishlist & Saved Items
          </h1>
          <p className="text-muted-foreground text-sm">
            Saved crop listings and price drop notifications
          </p>
        </div>
        <Link href="/marketplace">
          <Button className="bg-agri-600 hover:bg-agri-700">Explore Marketplace</Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading your wishlist...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <p className="font-semibold text-base">Your wishlist is currently empty</p>
              <p className="text-xs">Browse the marketplace and click the heart icon to save products here.</p>
            </div>
          ) : (
            items.map((item) => {
              const itemPrice = item.buy_now_price || item.base_price || 0;
              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🌿</span>
                      )}
                    </div>
                    <div>
                      <Link href={`/marketplace/${item.product_id}`} className="font-semibold text-base hover:underline flex items-center gap-1">
                        {item.title || 'Saved Crop Product'}
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity_available ? `${item.quantity_available} ${item.quantity_unit || 'kg'} available` : 'Available in Marketplace'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-agri-700 dark:text-agri-400">
                      {formatCurrency(itemPrice)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      title="Remove from wishlist"
                      onClick={() => removeItem(item.product_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
