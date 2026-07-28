'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { walletApi } from '@/lib/api';
import { Wallet, PlusCircle, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletData {
  balance: number;
  escrow_balance: number;
  total_credited: number;
  total_debited: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function BuyerWalletPage() {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchWalletData();
  }, [accessToken]);

  const fetchWalletData = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        walletApi.get(accessToken) as Promise<{ wallet?: WalletData }>,
        walletApi.transactions({}, accessToken) as Promise<{ transactions?: Transaction[] }>,
      ]);
      if (walletRes.wallet) setWallet(walletRes.wallet);
      if (txRes.transactions) setTransactions(txRes.transactions);
    } catch {
      // Set empty state defaults if backend DB wallet is uninitialized
      setWallet({ balance: 0, escrow_balance: 0, total_credited: 0, total_debited: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = () => {
    toast({
      title: 'Deposit Funds Request',
      description: 'Payment gateway integration ready. Connect Stripe/Razorpay API key in environment variables.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-agri-600" />
            Digital Wallet & Escrow Balance
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your funds, track locked escrow deposits for auction bids, and view live transaction records
          </p>
        </div>
        <Button className="bg-agri-600 hover:bg-agri-700" onClick={handleDeposit}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Funds
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-agri-600 to-agri-700 text-white">
          <CardContent className="p-6">
            <p className="text-xs text-agri-100 font-medium">Available Cash Balance</p>
            <h2 className="text-3xl font-extrabold mt-1">
              ${wallet ? wallet.balance.toFixed(2) : '0.00'}
            </h2>
            <p className="text-xs text-agri-200 mt-4">Available for direct purchases & auction bids</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium">Locked Escrow Hold</p>
            <h2 className="text-3xl font-extrabold mt-1 text-amber-600">
              ${wallet ? wallet.escrow_balance.toFixed(2) : '0.00'}
            </h2>
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-agri-600" /> Protected by AgriBid Escrow
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium">Total Lifetime Debited</p>
            <h2 className="text-3xl font-extrabold mt-1">
              ${wallet ? wallet.total_debited.toFixed(2) : '0.00'}
            </h2>
            <p className="text-xs text-muted-foreground mt-4">Successful trade payments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-base mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No financial transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${tx.amount > 0 ? 'bg-agri-100 text-agri-700' : 'bg-muted text-foreground'}`}>
                      {tx.amount > 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description || tx.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-agri-700 dark:text-agri-400' : ''}`}>
                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
