'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  LayoutDashboard, Package, ShoppingBag, TrendingUp, Wallet,
  Bell, Settings, LogOut, Menu, X, Bot, MessageSquare,
  Tractor, FileText, Users, BarChart3, Shield, Megaphone,
  MapPin, Truck, Star, Heart, Search, Award
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const farmerNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/farmer', icon: LayoutDashboard },
  { label: 'My Products', href: '/dashboard/farmer/products', icon: Package },
  { label: 'Auctions', href: '/dashboard/farmer/auctions', icon: TrendingUp },
  { label: 'Orders', href: '/dashboard/farmer/orders', icon: ShoppingBag },
  { label: 'Inventory', href: '/dashboard/farmer/inventory', icon: FileText },
  { label: 'Analytics', href: '/dashboard/farmer/analytics', icon: BarChart3 },
  { label: 'Earnings', href: '/dashboard/farmer/earnings', icon: Wallet },
  { label: 'AI Advisor', href: '/dashboard/farmer/ai', icon: Bot, badge: 'AI' },
  { label: 'Messages', href: '/dashboard/chat', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Reviews', href: '/dashboard/farmer/reviews', icon: Star },
  { label: 'Documents', href: '/dashboard/farmer/documents', icon: FileText },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const buyerNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/buyer', icon: LayoutDashboard },
  { label: 'Marketplace', href: '/marketplace', icon: Search },
  { label: 'My Orders', href: '/dashboard/buyer/orders', icon: ShoppingBag },
  { label: 'My Bids', href: '/dashboard/buyer/bids', icon: TrendingUp },
  { label: 'Wishlist', href: '/dashboard/buyer/wishlist', icon: Heart },
  { label: 'Wallet', href: '/dashboard/buyer/wallet', icon: Wallet },
  { label: 'Analytics', href: '/dashboard/buyer/analytics', icon: BarChart3 },
  { label: 'Nearby Farms', href: '/map', icon: MapPin },
  { label: 'AI Advisor', href: '/dashboard/buyer/ai', icon: Bot, badge: 'AI' },
  { label: 'Messages', href: '/dashboard/chat', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
  { label: 'KYC Review', href: '/dashboard/admin/kyc', icon: Shield },
  { label: 'Products', href: '/dashboard/admin/products', icon: Package },
  { label: 'Orders', href: '/dashboard/admin/orders', icon: ShoppingBag },
  { label: 'Auctions', href: '/dashboard/admin/auctions', icon: TrendingUp },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  { label: 'Revenue', href: '/dashboard/admin/revenue', icon: Wallet },
  { label: 'Announcements', href: '/dashboard/admin/announcements', icon: Megaphone },
  { label: 'Complaints', href: '/dashboard/admin/complaints', icon: MessageSquare },
  { label: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: FileText },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

const logisticsNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/logistics', icon: LayoutDashboard },
  { label: 'Deliveries', href: '/dashboard/logistics/deliveries', icon: Truck },
  { label: 'Pickup Requests', href: '/dashboard/logistics/pickups', icon: MapPin },
  { label: 'Earnings', href: '/dashboard/logistics/earnings', icon: Wallet },
  { label: 'Ratings', href: '/dashboard/logistics/ratings', icon: Award },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function getNav(role: string): NavItem[] {
  switch (role) {
    case 'farmer': return farmerNav;
    case 'buyer': return buyerNav;
    case 'admin': case 'super_admin': return adminNav;
    case 'logistics': return logisticsNav;
    default: return buyerNav;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !accessToken) {
      router.push('/auth/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [hasHydrated, isAuthenticated, accessToken, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Authenticating session...</div>
      </div>
    );
  }

  const navItems = getNav(user?.role ?? 'buyer');

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-agri-600">
          <Tractor className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg">AgriBid</span>
        {user?.role && (
          <Badge variant="secondary" className="ml-auto text-xs capitalize">
            {user.role}
          </Badge>
        )}
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-agri-100 dark:bg-agri-900/40 flex items-center justify-center text-lg font-bold text-agri-700 dark:text-agri-300 shrink-0">
            {user?.full_name?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{user?.full_name ?? 'Guest'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-agri-100 text-agri-800 dark:bg-agri-900/40 dark:text-agri-200'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-agri-700 dark:text-agri-300' : '')} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge className="text-xs py-0 bg-agri-600 text-white">{item.badge}</Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Logout & Theme */}
      <div className="p-4 border-t flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          className="flex-1 justify-start gap-3 text-muted-foreground hover:text-destructive text-sm"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-col border-r bg-card shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-card border-r z-10 animate-slide-in-right">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex h-16 items-center justify-between px-4 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-agri-600">
              <Tractor className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold">AgriBid</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
