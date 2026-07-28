'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle } from 'lucide-react';

export default function AdminComplaintsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-agri-600" />
          Dispute & Support Complaints
        </h1>
        <p className="text-muted-foreground text-sm">
          Review customer dispute tickets, delivery delays, and product quality complaints
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {[
            { id: 'tkt-1', user: 'City Wholesale', issue: 'Delivery delay of Order #ORD-101', status: 'open', date: '2026-07-26' },
            { id: 'tkt-2', user: 'Farmer Ram', issue: 'Payout calculation inquiry', status: 'resolved', date: '2026-07-20' },
          ].map((tkt) => (
            <div key={tkt.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{tkt.id}</span>
                  <h3 className="font-semibold text-sm">{tkt.issue}</h3>
                  <Badge variant={tkt.status === 'open' ? 'destructive' : 'secondary'}>{tkt.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Submitted by: {tkt.user} • Date: {tkt.date}</p>
              </div>

              {tkt.status === 'open' && (
                <Button size="sm" className="bg-agri-600 hover:bg-agri-700">
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Resolved
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
