'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { reviewApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Star, ThumbsUp, User, MessageSquare } from 'lucide-react';

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  buyer_name?: string;
  product_title?: string;
}

export default function FarmerReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [user?.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = user?.id ? { user_id: user.id } : {};
      const res = await reviewApi.list(params) as { reviews?: ReviewItem[] };
      setReviews(res.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
          Customer Ratings & Reviews
        </h1>
        <p className="text-muted-foreground text-sm">
          Feedback and ratings provided by buyers who purchased your crop listings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600">
              <Star className="h-6 w-6 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Average Seller Rating</p>
              <p className="text-2xl font-bold">{avgRating} / 5.0</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 rounded-xl text-agri-700">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Reviews</p>
              <p className="text-2xl font-bold">{reviews.length} Reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {reviews.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold">No customer reviews yet</p>
              <p className="text-xs">When buyers purchase and rate your crops, their reviews will appear here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((rev) => (
                <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{rev.buyer_name || 'Verified Buyer'}</h3>
                        <p className="text-xs text-muted-foreground">Product: {rev.product_title || 'Crop Listing'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90 pl-10">{rev.comment || 'No written comment provided.'}</p>
                  <p className="text-[11px] text-muted-foreground pl-10">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
