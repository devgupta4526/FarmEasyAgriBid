'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ThumbsUp, User } from 'lucide-react';

export default function FarmerReviewsPage() {
  const reviews = [
    { id: 'rev-1', buyer: 'Metro Fresh Markets', crop: 'Organic Wheat', rating: 5, comment: 'Excellent crop quality! Very clean grain and fast dispatch.', date: '2026-07-22' },
    { id: 'rev-2', buyer: 'Quality Grain Traders', crop: 'Basmati Rice', rating: 4, comment: 'Great moisture levels and good packaging. Recommended seller.', date: '2026-07-15' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600">
              <Star className="h-6 w-6 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Average Rating</p>
              <p className="text-2xl font-bold">4.8 / 5.0</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 rounded-xl text-agri-700">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Positive Satisfaction</p>
              <p className="text-2xl font-bold">96%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {reviews.map((rev) => (
            <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{rev.buyer}</h3>
                    <p className="text-xs text-muted-foreground">Product: {rev.crop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-foreground/90 pl-10">{rev.comment}</p>
              <p className="text-[11px] text-muted-foreground pl-10">{rev.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
