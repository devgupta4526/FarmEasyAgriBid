'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Star } from 'lucide-react';

export default function LogisticsRatingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-agri-600" />
          Driver Delivery Ratings & Feedback
        </h1>
        <p className="text-muted-foreground text-sm">
          Customer ratings and reviews on delivery speed, care, and handling
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl">
              <Star className="h-6 w-6 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Driver Rating Score</p>
              <p className="text-3xl font-extrabold">4.9 / 5.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
