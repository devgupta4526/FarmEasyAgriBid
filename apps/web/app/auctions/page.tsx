'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { auctionApi } from '@/lib/api';
import { formatCurrency, countdown } from '@/lib/utils';
import { Clock, Users, Zap, TrendingUp, Filter } from 'lucide-react';
import { useEffect } from 'react';

interface Auction {
  id: string;
  status: string;
  current_bid: number;
  start_price: number;
  buy_now_price?: number;
  ends_at: string;
  total_bids: number;
  title: string;
  thumbnail_url?: string;
  images: string[];
  quantity_available: number;
  quantity_unit: string;
  quality_grade: string;
  is_organic: boolean;
  location_text: string;
  state: string;
  farmer_name: string;
  farmer_rating: number;
  farmer_verified: boolean;
  category_name: string;
}

function AuctionCard({ auction }: { auction: Auction }) {
  const [timeLeft, setTimeLeft] = useState(countdown(auction.ends_at));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(countdown(auction.ends_at)), 1000);
    return () => clearInterval(interval);
  }, [auction.ends_at]);

  const isEndingSoon = new Date(auction.ends_at).getTime() - Date.now() < 3600000; // < 1hr

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Link href={`/auctions/${auction.id}`}>
        <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            {auction.thumbnail_url || auction.images?.[0] ? (
              <img
                src={auction.thumbnail_url || auction.images[0]}
                alt={auction.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-5xl">🌾</div>
            )}
            <div className="absolute top-2 left-2 flex gap-1">
              {auction.status === 'live' && (
                <Badge className="bg-red-500 text-white text-xs gap-1 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />LIVE
                </Badge>
              )}
              {auction.is_organic && (
                <Badge className="bg-agri-600 text-white text-xs">🌿</Badge>
              )}
            </div>
            {auction.buy_now_price && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-yellow-500 text-white text-xs gap-1">
                  <Zap className="h-2.5 w-2.5" />Buy Now
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <p className="font-semibold text-sm line-clamp-2 mb-2">{auction.title}</p>

            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Current Bid</p>
                <p className="text-lg font-bold text-agri-600">
                  {formatCurrency(parseFloat(String(auction.current_bid || auction.start_price)))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Ends in</p>
                <p className={`text-sm font-mono font-bold ${isEndingSoon ? 'text-red-500' : 'text-foreground'}`}>
                  {timeLeft}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{auction.total_bids} bids</span>
              </div>
              <span>{auction.quantity_available}{auction.quantity_unit} · {auction.quality_grade}</span>
            </div>

            <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>{auction.farmer_name} {auction.farmer_verified ? '✓' : ''}</span>
              <span>{auction.state}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function AuctionsPage() {
  const [status, setStatus] = useState('live');

  const { data, isLoading } = useQuery({
    queryKey: ['auctions', status],
    queryFn: () => auctionApi.list({ status }) as Promise<{ auctions: Auction[] }>,
    refetchInterval: status === 'live' ? 30000 : undefined,
  });

  const statuses = [
    { value: 'live', label: '🔴 Live Now' },
    { value: 'scheduled', label: '📅 Upcoming' },
    { value: 'ended', label: '✅ Ended' },
  ];

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Live Auctions</h1>
          <p className="text-muted-foreground mt-1">Real-time bidding on fresh farm produce</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              status === s.value
                ? 'bg-agri-600 text-white'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-72" />
          ))}
        </div>
      ) : !data?.auctions?.length ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold mb-2">No {status} auctions</h3>
          <p className="text-muted-foreground">Check back soon for new listings.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
