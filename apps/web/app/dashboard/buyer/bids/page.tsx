'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function BuyerBidsPage() {
  const bids = [
    { id: 'bid-1', auctionTitle: 'Organic Wheat (100 Quintals)', myBid: 420, currentHighest: 420, status: 'winning', endsAt: '2026-07-29T18:00:00Z' },
    { id: 'bid-2', auctionTitle: 'Basmati Rice Crop Harvest', myBid: 920, currentHighest: 950, status: 'outbid', endsAt: '2026-07-30T12:00:00Z' },
    { id: 'bid-3', auctionTitle: 'Fresh Mustard Seed Stock', myBid: 280, currentHighest: 280, status: 'won', endsAt: '2026-07-27T10:00:00Z' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-agri-600" />
            My Auction Bids
          </h1>
          <p className="text-muted-foreground text-sm">
            Track active auction bids, outbid alerts, and won auction lots
          </p>
        </div>
        <Link href="/auctions">
          <Button className="bg-agri-600 hover:bg-agri-700">Explore Live Auctions</Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {bids.map((bid) => (
            <div key={bid.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">{bid.auctionTitle}</h3>
                  <Badge
                    variant={bid.status === 'winning' || bid.status === 'won' ? 'default' : 'secondary'}
                    className={bid.status === 'winning' || bid.status === 'won' ? 'bg-agri-600' : 'bg-amber-100 text-amber-800'}
                  >
                    {bid.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  My Highest Bid: <span className="font-bold text-foreground">${bid.myBid}</span> • Current Highest: ${bid.currentHighest}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/auctions">
                  <Button variant="outline" size="sm">
                    {bid.status === 'outbid' ? 'Increase Bid' : 'View Auction'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
