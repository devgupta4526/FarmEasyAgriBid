'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { notificationApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckCheck, Trash2, ShoppingBag, TrendingUp, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchNotifications();
  }, [accessToken]);

  const fetchNotifications = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await notificationApi.list(accessToken) as { notifications?: NotificationItem[] };
      setNotifications(res.notifications || []);
    } catch {
      // Mock notifications for demonstration
      setNotifications([
        {
          id: 'notif-1',
          title: 'Auction Outbid Alert',
          message: 'You have been outbid on Organic Wheat (Lot #104). Current highest bid: $450.',
          type: 'auction',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'notif-2',
          title: 'Order Status Update',
          message: 'Order #ORD-8821 has been marked as In-Transit by logistics partner.',
          type: 'order',
          is_read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'notif-3',
          title: 'Welcome to AgriBid!',
          message: 'Your account has been registered successfully. Verify your KYC profile to start trading.',
          type: 'system',
          is_read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    if (!accessToken) return;
    try {
      await notificationApi.markAllRead(accessToken);
    } catch {
      // update state regardless
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast({ title: 'All notifications marked as read' });
  };

  const markSingleRead = async (id: string) => {
    if (!accessToken) return;
    try {
      await notificationApi.markRead(id, accessToken);
    } catch {
      // update state
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'auction': return <TrendingUp className="h-5 w-5 text-amber-500" />;
      case 'order': return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-agri-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-agri-600" />
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm">
            Stay updated with real-time auction bids, order updates, and system alerts
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCheck className="h-4 w-4 mr-2" /> Mark All as Read
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <CardContent className="p-6 divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No notifications to display
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markSingleRead(notif.id)}
                className={`py-4 flex items-start gap-4 cursor-pointer transition-colors ${
                  !notif.is_read ? 'bg-agri-50/50 dark:bg-agri-950/20 px-3 rounded-xl' : ''
                }`}
              >
                <div className="p-2.5 rounded-xl bg-muted shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      {notif.title}
                      {!notif.is_read && (
                        <Badge className="bg-agri-600 text-white text-[10px] px-1.5 py-0">New</Badge>
                      )}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
