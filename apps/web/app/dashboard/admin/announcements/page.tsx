'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [announcements, setAnnouncements] = useState([
    { id: 'anc-1', title: 'Kharif Harvest Bidding Season Open', date: '2026-07-20', audience: 'All Users' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    const newAnc = { id: `anc-${Date.now()}`, title, date: new Date().toISOString().split('T')[0], audience: 'All Users' };
    setAnnouncements((prev) => [newAnc, ...prev]);
    setTitle('');
    setMessage('');
    toast({ title: 'Announcement broadcasted successfully' });
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
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter announcement details..."
                className="w-full p-3 h-24 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" className="bg-agri-600 hover:bg-agri-700">
              <Megaphone className="h-4 w-4 mr-2" /> Broadcast Announcement
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
                <p className="text-xs text-muted-foreground">Target: {anc.audience} • Date: {anc.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
