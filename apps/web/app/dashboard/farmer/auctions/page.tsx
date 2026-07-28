'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { auctionApi } from '@/lib/api';
import { TrendingUp, Plus, Clock, Gavel, CheckCircle } from 'lucide-react';

interface AuctionItem {
  id: string;
  title: string;
  starting_price: number;
  current_bid: number;
  total_bids: number;
  status: string;
  ends_at: string;
}

export default function FarmerAuctionsPage() {
  const { accessToken } = useAuthStore();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, [accessToken]);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const res = await auctionApi.list({}) as { auctions?: AuctionItem[] };
      setAuctions(res.auctions || []);
    } catch {
      // Mock data for farmer auctions
      setAuctions([
        {
          id: 'auc-1',
          title: 'Premium Organic Wheat (100 Quintals)',
          starting_price: 350,
          current_bid: 420,
          total_bids: 14,
          status: 'active',
          ends_at: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          id: 'auc-2',
          title: 'Basmati Rice Crop Harvest',
          starting_price: 800,
          current_bid: 950,
          total_bids: 8,
          status: 'active',
          ends_at: new Date(Date.now() + 172800000).toISOString(),
        },
        {
          id: 'auc-3',
          title: 'Fresh Mustard Seed Stock',
          starting_price: 200,
          current_bid: 280,
          total_bids: 22,
          status: 'ended',
          ends_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-agri-600" />
            My Auction Listings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your live auctions, monitor incoming bids, and create new auctions
          </p>
        </div>
        <Link href="/auctions">
          <Button className="bg-agri-600 hover:bg-agri-700">
            <Plus className="h-4 w-4 mr-2" /> Create Auction
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-700 dark:text-amber-300">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Auctions</p>
              <p className="text-2xl font-bold">
                {auctions.filter((a) => a.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 rounded-xl text-agri-700 dark:text-agri-300">
              <Gavel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Bids Placed</p>
              <p className="text-2xl font-bold">
                {auctions.reduce((acc, a) => acc + (a.total_bids || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-700 dark:text-blue-300">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Completed Auctions</p>
              <p className="text-2xl font-bold">
                {auctions.filter((a) => a.status === 'ended').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {auctions.map((auction) => (
            <div key={auction.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">{auction.title}</h3>
                  <Badge variant={auction.status === 'active' ? 'default' : 'secondary'} className={auction.status === 'active' ? 'bg-agri-600' : ''}>
                    {auction.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span>Start: ${auction.starting_price}</span>
                  <span>Bids: {auction.total_bids}</span>
                  <span>Ends: {new Date(auction.ends_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Current Highest Bid</p>
                  <p className="text-lg font-bold text-agri-700 dark:text-agri-400">
                    ${auction.current_bid}
                  </p>
                </div>
                <Link href={`/auctions/${auction.id}`}>
                  <Button variant="outline" size="sm">
                    View Bids
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
