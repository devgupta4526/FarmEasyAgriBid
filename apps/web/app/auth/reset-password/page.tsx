'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token || !uid) {
      toast({
        title: 'Invalid Reset Link',
        description: 'The password reset link is invalid or expired.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        uid,
        password: data.password,
      });
      setCompleted(true);
      toast({ title: 'Password reset successful!' });
    } catch (err) {
      toast({
        title: 'Reset failed',
        description: (err as Error).message || 'Failed to reset password. Link may be expired.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-agri-600 dark:bg-agri-900/40">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Password Reset Complete</h2>
        <p className="text-sm text-muted-foreground">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <div className="pt-4">
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-agri-600 hover:bg-agri-700 h-11"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="text-sm font-medium mb-1.5 block" htmlFor="password">
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? 'text' : 'password'}
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
        {errors.password && (
          <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block" htmlFor="confirmPassword">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type={showPass ? 'text' : 'password'}
          className="w-full h-10 px-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="••••••••"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-agri-600 hover:bg-agri-700 h-11"
        disabled={loading}
      >
        {loading ? 'Updating password...' : 'Reset Password'}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/auth/login"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Return to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Enter a strong new password for your account
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <Suspense fallback={<div className="text-center py-6 text-sm text-muted-foreground">Loading reset form...</div>}>
              <ResetPasswordFormContent />
            </Suspense>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
