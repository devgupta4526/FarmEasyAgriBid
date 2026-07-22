'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';

interface KYCEntry {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  profile_id: string;
  kyc_status: string;
  kyc_submitted_at: string;
  aadhar_doc_url?: string;
  pan_doc_url?: string;
  land_doc_url?: string;
  aadhar_number?: string;
  pan_number?: string;
}

export default function AdminKYCPage() {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: () => adminApi.pendingKyc(accessToken!) as Promise<{ pending_kyc: KYCEntry[] }>,
    enabled: !!accessToken,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ userId, decision, reason }: { userId: string; decision: string; reason?: string }) =>
      adminApi.reviewKyc(userId, decision, reason, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      toast({ title: 'KYC decision saved' });
    },
    onError: (err) => {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    },
  });

  const handleDecision = (userId: string, decision: 'approved' | 'rejected') => {
    let reason: string | undefined;
    if (decision === 'rejected') {
      reason = prompt('Rejection reason:') || undefined;
    }
    reviewMutation.mutate({ userId, decision, reason });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-agri-600" /> KYC Review
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Review and approve farmer identity verifications</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : !data?.pending_kyc?.length ? (
        <div className="text-center py-20">
          <CheckCircle className="h-16 w-16 text-agri-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">No pending KYC reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.pending_kyc.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-agri-100 dark:bg-agri-900/30 flex items-center justify-center font-bold text-agri-700">
                        {entry.full_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.full_name}</p>
                        <p className="text-sm text-muted-foreground">{entry.email}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">{entry.role}</Badge>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 mt-4">
                      {entry.aadhar_doc_url && (
                        <a href={entry.aadhar_doc_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Aadhar Card
                          </Button>
                        </a>
                      )}
                      {entry.pan_doc_url && (
                        <a href={entry.pan_doc_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                            PAN Card
                          </Button>
                        </a>
                      )}
                      {entry.land_doc_url && (
                        <a href={entry.land_doc_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Land Records
                          </Button>
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                      {entry.aadhar_number && <span>Aadhar: ****{entry.aadhar_number.slice(-4)}</span>}
                      {entry.pan_number && <span>· PAN: {entry.pan_number.slice(0, 3)}***</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      onClick={() => handleDecision(entry.id, 'approved')}
                      className="bg-agri-600 hover:bg-agri-700 gap-2 flex-1 sm:flex-none"
                      disabled={reviewMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleDecision(entry.id, 'rejected')}
                      variant="destructive"
                      className="gap-2 flex-1 sm:flex-none"
                      disabled={reviewMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
