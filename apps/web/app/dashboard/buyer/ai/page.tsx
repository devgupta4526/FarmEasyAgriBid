'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export default function BuyerAiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-agri-600" />
          Buyer AI Intelligence Hub
        </h1>
        <p className="text-muted-foreground text-sm">
          Google Gemini powered price benchmarks, crop demand forecasting, and procurement intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 text-agri-700 rounded-xl w-fit">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Price Fair Valuation</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Evaluate market rates before placing auction bids or direct purchases.
              </p>
            </div>
            <Link href="/ai">
              <Button className="w-full bg-agri-600 hover:bg-agri-700">
                Check Fair Prices <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-700 rounded-xl w-fit">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Crop Supply Forecast</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Predict upcoming seasonal harvests and price fluctuations.
              </p>
            </div>
            <Link href="/ai">
              <Button variant="outline" className="w-full">
                View Forecast <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
