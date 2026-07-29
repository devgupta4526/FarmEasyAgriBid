'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_roles?: string;
  created_at?: string;
}

export default function AdminAnnouncementsPage() {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 'anc-1', title: 'Kharif Harvest Bidding Season Open', content: 'Bidding is now open for all Kharif crops across regions.', created_at: new Date().toISOString() },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    if (!accessToken) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.createAnnouncement(
        {
          title,
          content: message,
          target_roles: targetRole === 'all' ? undefined : targetRole,
        },
        accessToken
      ) as { announcement?: Announcement };

      const created = res.announcement || {
        id: `anc-${Date.now()}`,
        title,
        content: message,
        created_at: new Date().toISOString(),
      };

      setAnnouncements((prev) => [created, ...prev]);
      setTitle('');
      setMessage('');
      toast({ title: 'Announcement broadcasted successfully' });
    } catch (err) {
      toast({
        title: 'Broadcast Failed',
        description: (err as Error).message || 'Failed to persist announcement to backend.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-agri-600" />
          System Announcements
        </h1>
        <p className="text-muted-foreground text-sm">
          Broadcast system notifications and harvest season updates to farmers & buyers
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold mb-4">Create Broadcast Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. System Maintenance Notice"
                className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Users (Farmers & Buyers)</option>
                <option value="farmer">Farmers Only</option>
                <option value="buyer">Buyers Only</option>
                <option value="logistics">Logistics Only</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter announcement details..."
                className="w-full p-3 h-24 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <Button type="submit" className="bg-agri-600 hover:bg-agri-700" disabled={submitting}>
              <Megaphone className="h-4 w-4 mr-2" />
              {submitting ? 'Broadcasting...' : 'Broadcast Announcement'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          <h3 className="font-semibold text-base pb-3">Active Announcements</h3>
          {announcements.map((anc) => (
            <div key={anc.id} className="py-3 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">{anc.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{anc.content}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Target: {anc.target_roles || 'All Users'} • Date: {anc.created_at ? new Date(anc.created_at).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
