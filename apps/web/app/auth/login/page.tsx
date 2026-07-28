'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Leaf } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

const roleRedirects: Record<string, string> = {
  farmer: '/dashboard/farmer',
  buyer: '/dashboard/buyer',
  admin: '/dashboard/admin',
  super_admin: '/dashboard/admin',
  logistics: '/dashboard/logistics',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login({
        email: data.email || undefined,
        password: data.password,
      }) as { user: { id: string; email: string | null; phone: string | null; role: string; status: string; full_name: string; email_verified: boolean; phone_verified: boolean }; access_token: string; refresh_token: string };

      login(res.user as Parameters<typeof login>[0], res.access_token, res.refresh_token);
      toast({ title: `Welcome back, ${res.user.full_name?.split(' ')[0]}! 👋` });
      router.push(roleRedirects[res.user.role] || '/dashboard/buyer');
    } catch (err) {
      toast({ title: 'Login failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-agri-50 via-background to-earth-50 dark:from-agri-950/30 dark:to-earth-950/30">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-agri-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-2xl">AgriBid</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-agri-600 hover:underline font-medium">Register free</Link>
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full h-10 px-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium" htmlFor="password">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-agri-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full h-10 px-3 pr-10 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-agri-600 hover:bg-agri-700 h-11" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
