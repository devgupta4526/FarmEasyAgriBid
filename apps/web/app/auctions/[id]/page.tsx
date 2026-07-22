'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { auctionApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, countdown } from '@/lib/utils';
import { Zap, Clock, Users, TrendingUp, Shield, Star, Bot } from 'lucide-react';

interface Bid {
  id: string;
  amount: number;
  bidder_name: string;
  bidder_avatar?: string;
  created_at: string;
  is_auto_bid?: boolean;
}

interface AuctionData {
  id: string;
  status: string;
  current_bid: number;
  start_price: number;
  reserve_price?: number;
  buy_now_price?: number;
  bid_increment: number;
  ends_at: string;
  total_bids: number;
  title: string;
  description: string;
  images: string[];
  quantity_available: number;
  quantity_unit: string;
  quality_grade: string;
  is_organic: boolean;
  location_text: string;
  farmer_name: string;
  farmer_rating: number;
  farmer_verified: boolean;
}

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { toast } = useToast();

  const [bids, setBids] = useState<Bid[]>([]);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [endsAt, setEndsAt] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [maxAutoBid, setMaxAutoBid] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeViewers, setActiveViewers] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      const res = await auctionApi.get(id) as { auction: AuctionData; bids: Bid[] };
      return res;
    },
  });

  useEffect(() => {
    if (data) {
      setCurrentBid(parseFloat(String(data.auction.current_bid || data.auction.start_price)));
      setEndsAt(data.auction.ends_at);
      setBids(data.bids || []);
      setIsLive(data.auction.status === 'live');
    }
  }, [data]);

  // Countdown timer
  useEffect(() => {
    if (!endsAt) return;
    const interval = setInterval(() => {
      setTimeLeft(countdown(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  // Socket.IO connection
  useEffect(() => {
    if (!id) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';
    const sock = io(apiUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    sock.on('connect', () => {
      sock.emit('join_auction', id);
    });

    sock.on('new_bid', (data: { bid: Bid; current_bid: number; total_bids: number; ends_at: string }) => {
      setCurrentBid(data.current_bid);
      setEndsAt(data.ends_at);
      setBids((prev) => [data.bid, ...prev].slice(0, 50));
    });

    sock.on('auction_ended', () => {
      setIsLive(false);
      toast({ title: '⚡ Auction Ended', description: 'This auction has ended.' });
    });

    setSocket(sock);
    return () => {
      sock.emit('leave_auction', id);
      sock.disconnect();
    };
  }, [id, accessToken, toast]);

  const minBid = currentBid + (data?.auction.bid_increment ?? 10);

  const placeBid = async () => {
    if (!user || !accessToken) {
      router.push('/auth/login');
      return;
    }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      toast({ title: 'Invalid bid', description: `Minimum bid is ${formatCurrency(minBid)}`, variant: 'destructive' });
      return;
    }

    setBidding(true);
    try {
      await auctionApi.bid(id, amount, accessToken);
      toast({ title: '✅ Bid placed!', description: `Your bid of ${formatCurrency(amount)} was placed.` });
      setBidAmount('');
    } catch (err) {
      toast({ title: 'Bid failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setBidding(false);
    }
  };

  const setAutoBid = async () => {
    if (!user || !accessToken) {
      router.push('/auth/login');
      return;
    }
    const max = parseFloat(maxAutoBid);
    if (isNaN(max) || max <= currentBid) {
      toast({ title: 'Invalid auto-bid', description: 'Must be greater than current bid', variant: 'destructive' });
      return;
    }

    try {
      await auctionApi.autoBid(id, max, accessToken);
      toast({ title: '🤖 Auto-bid set!', description: `Auto-bidding up to ${formatCurrency(max)}` });
      setMaxAutoBid('');
    } catch (err) {
      toast({ title: 'Auto-bid failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const buyNow = async () => {
    if (!user || !accessToken || !data?.auction.buy_now_price) return;
    if (confirm(`Buy now for ${formatCurrency(data.auction.buy_now_price)}?`)) {
      try {
        await auctionApi.buyNow(id, accessToken);
        toast({ title: '🎉 Purchase successful!', description: 'Check your orders for details.' });
        router.push('/dashboard/buyer/orders');
      } catch (err) {
        toast({ title: 'Purchase failed', description: (err as Error).message, variant: 'destructive' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-80 rounded-2xl" />
            <div className="skeleton h-32 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const auction = data?.auction;
  if (!auction) return <div className="page-container py-16 text-center text-muted-foreground">Auction not found.</div>;

  return (
    <div className="page-container py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Product */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video">
            {auction.images?.[0] ? (
              <img src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl">🌾</div>
            )}
            {isLive && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500 text-white gap-1.5 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  LIVE
                </Badge>
              </div>
            )}
            {auction.is_organic && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-agri-600 text-white">🌿 Organic</Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{auction.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{auction.quality_grade} Grade</Badge>
                    <Badge variant="outline">{auction.quantity_available} {auction.quantity_unit}</Badge>
                    <span className="text-sm text-muted-foreground">{auction.location_text}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{auction.farmer_rating}</span>
                  </div>
                  <span className="text-muted-foreground">{auction.farmer_name}</span>
                  {auction.farmer_verified && <Badge className="text-xs bg-agri-600 text-white">✓</Badge>}
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">{auction.description}</p>
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bid History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {bids.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">No bids yet. Be the first!</p>
                  ) : (
                    bids.map((bid, i) => (
                      <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-2.5 rounded-lg ${i === 0 ? 'bg-agri-50 dark:bg-agri-900/20 border border-agri-200 dark:border-agri-800' : 'bg-muted/40'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-agri-100 dark:bg-agri-900/40 flex items-center justify-center text-xs font-bold text-agri-700">
                            {bid.bidder_name?.[0] ?? '?'}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{i === 0 ? '👑 ' : ''}{bid.bidder_name}</span>
                            {bid.is_auto_bid && <span className="ml-1 text-xs text-muted-foreground">(auto)</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${i === 0 ? 'text-agri-600' : ''}`}>
                            {formatCurrency(bid.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bid.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Bidding Panel */}
        <div className="space-y-4">
          {/* Current Bid */}
          <Card className="border-2 border-agri-200 dark:border-agri-800">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                <motion.p
                  key={currentBid}
                  initial={{ scale: 1.1, color: '#16a34a' }}
                  animate={{ scale: 1, color: 'inherit' }}
                  className="text-4xl font-bold text-agri-600"
                >
                  {formatCurrency(currentBid)}
                </motion.p>
                <p className="text-sm text-muted-foreground mt-1">
                  {auction.total_bids} bid{auction.total_bids !== 1 ? 's' : ''} placed
                </p>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 mb-4">
                <Clock className={`h-4 w-4 ${isLive ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                <span className={`font-mono font-bold ${isLive ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {timeLeft || '--:--'}
                </span>
              </div>

              {/* Bid Input */}
              {isLive && user?.role === 'buyer' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Min bid: <span className="font-medium text-foreground">{formatCurrency(minBid)}</span>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={String(minBid)}
                        className="flex-1 h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        min={minBid}
                      />
                      <Button
                        onClick={placeBid}
                        disabled={bidding || !bidAmount}
                        className="bg-agri-600 hover:bg-agri-700"
                      >
                        {bidding ? '...' : 'Bid'}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Bid Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[minBid, minBid + 50, minBid + 100].map((v) => (
                      <button
                        key={v}
                        onClick={() => setBidAmount(String(v))}
                        className="text-xs py-1.5 rounded-lg border hover:bg-muted transition-colors"
                      >
                        {formatCurrency(v)}
                      </button>
                    ))}
                  </div>

                  {/* Auto Bid */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Bot className="h-3.5 w-3.5" /> Auto-Bid (max)
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={maxAutoBid}
                        onChange={(e) => setMaxAutoBid(e.target.value)}
                        placeholder="e.g. 5000"
                        className="flex-1 h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <Button variant="outline" onClick={setAutoBid} disabled={!maxAutoBid}>
                        Set
                      </Button>
                    </div>
                  </div>

                  {/* Buy Now */}
                  {auction.buy_now_price && (
                    <Button
                      onClick={buyNow}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Buy Now — {formatCurrency(auction.buy_now_price)}
                    </Button>
                  )}
                </div>
              )}

              {!user && (
                <Button onClick={() => router.push('/auth/login')} className="w-full bg-agri-600 hover:bg-agri-700">
                  Login to Bid
                </Button>
              )}

              {user?.role === 'farmer' && (
                <p className="text-xs text-center text-muted-foreground">Farmers cannot bid on auctions.</p>
              )}
            </CardContent>
          </Card>

          {/* Anti-snipe notice */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-agri-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Anti-Sniping Protection</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    If a bid is placed in the final minute, the auction extends by 2 minutes — keeping it fair for everyone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-agri-600" />
                <p className="text-sm font-medium">Auction Info</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Price</span>
                  <span>{formatCurrency(auction.start_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bid Increment</span>
                  <span>{formatCurrency(auction.bid_increment)}</span>
                </div>
                {auction.reserve_price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reserve Price</span>
                    <span className="text-muted-foreground">Hidden</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
