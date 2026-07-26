'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tractor, ShoppingCart, TrendingUp, Leaf, Zap, Shield,
  BarChart3, MessageSquare, MapPin, Star, ChevronRight,
  ArrowRight, Play
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const stats = [
  { label: 'Farmers', value: '50,000+' },
  { label: 'Buyers', value: '20,000+' },
  { label: 'Products Listed', value: '2M+' },
  { label: 'Transactions', value: '₹500Cr+' },
];

const features = [
  {
    icon: Zap,
    title: 'Live Auctions',
    desc: 'Real-time bidding with anti-sniping protection, auto-bid, and countdown timers.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    icon: TrendingUp,
    title: 'AI Price Advisor',
    desc: 'Powered by Google Gemini — get real-time price suggestions, demand forecasts, and market insights.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Leaf,
    title: 'Organic Certified',
    desc: 'Verified organic listings with certification upload and organic quality badges.',
    color: 'text-agri-600',
    bg: 'bg-agri-50 dark:bg-agri-900/20',
  },
  {
    icon: MapPin,
    title: 'Local Discovery',
    desc: 'Find fresh produce nearby using OpenStreetMap — zero Google Maps costs.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Chat',
    desc: 'Instant messaging with media, voice notes, typing indicators, and seen status.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: Shield,
    title: 'Secure & Verified',
    desc: 'KYC verification, escrow payments, fraud detection, and RBAC security.',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
];

const categories = [
  { name: 'Vegetables', emoji: '🥦', slug: 'vegetables' },
  { name: 'Fruits', emoji: '🍎', slug: 'fruits' },
  { name: 'Grains', emoji: '🌾', slug: 'grains' },
  { name: 'Organic', emoji: '🌿', slug: 'organic' },
  { name: 'Dairy', emoji: '🥛', slug: 'dairy' },
  { name: 'Spices', emoji: '🌶️', slug: 'spices' },
  { name: 'Flowers', emoji: '🌸', slug: 'flowers' },
  { name: 'Honey', emoji: '🍯', slug: 'honey' },
  { name: 'Others', emoji: '🫑', slug: 'others' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="page-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-agri-600">
              <Tractor className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AgriBid</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
            <Link href="/auctions" className="text-muted-foreground hover:text-foreground transition-colors">Live Auctions</Link>
            <Link href="/map" className="text-muted-foreground hover:text-foreground transition-colors">Find Farms</Link>
            <Link href="/ai" className="text-muted-foreground hover:text-foreground transition-colors">AI Advisor</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-agri-600 hover:bg-agri-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-agri-50 via-background to-earth-50 dark:from-agri-950/30 dark:via-background dark:to-earth-950/30" />

        <div className="page-container relative">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-6 bg-agri-100 text-agri-800 border-agri-200 dark:bg-agri-900/40 dark:text-agri-300">
                🌾 India&apos;s First AI-Powered Farm Marketplace
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Farm Fresh.{' '}
              <span className="text-agri-600 dark:text-agri-400">Bid Smart.</span>
              <br />
              Earn More.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Connect directly with buyers through live auctions and instant purchases.
              Get AI-powered price advice, demand forecasts, and crop recommendations.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register?role=farmer">
                <Button size="lg" className="bg-agri-600 hover:bg-agri-700 gap-2 w-full sm:w-auto">
                  <Tractor className="h-5 w-5" />
                  I&apos;m a Farmer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/register?role=buyer">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <ShoppingCart className="h-5 w-5" />
                  I&apos;m a Buyer
                </Button>
              </Link>
              <Link href="/auctions">
                <Button size="lg" variant="ghost" className="gap-2 w-full sm:w-auto">
                  <Play className="h-4 w-4" />
                  Watch Live Auctions
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-10">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-agri-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Browse Categories</h2>
            <p className="text-muted-foreground">From farm-fresh vegetables to rare spices — all in one place.</p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/marketplace?category=${cat.slug}`}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card hover:border-agri-300 hover:bg-agri-50 dark:hover:bg-agri-900/20 transition-all cursor-pointer group">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                    <span className="text-xs font-medium text-center">{cat.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete marketplace ecosystem built for modern Indian agriculture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-agri-600 p-10 md:p-16 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Transform Your Farming?
              </h2>
              <p className="text-agri-100 text-lg mb-8 max-w-xl mx-auto">
                Join 50,000+ farmers already earning more with AgriBid&apos;s smart marketplace.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-agri-700 hover:bg-agri-50 font-semibold gap-2">
                  Start for Free
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="page-container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-agri-600">
                  <Tractor className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl">AgriBid</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered farmer marketplace connecting India&apos;s agricultural ecosystem.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/marketplace" className="hover:text-foreground">Marketplace</Link></li>
                <li><Link href="/auctions" className="hover:text-foreground">Live Auctions</Link></li>
                <li><Link href="/ai" className="hover:text-foreground">AI Advisor</Link></li>
                <li><Link href="/map" className="hover:text-foreground">Find Farms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Farmers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/register?role=farmer" className="hover:text-foreground">Register as Farmer</Link></li>
                <li><Link href="/dashboard/farmer" className="hover:text-foreground">Farmer Dashboard</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Seller Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/support" className="hover:text-foreground">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AgriBid. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              Rated 4.8/5 by farmers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
