'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Leaf, ArrowLeft, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSubmitted(true);
      toast({
        title: 'Reset instructions sent',
        description: 'If an account exists with that email, password reset instructions have been sent.',
      });
    } catch (err) {
      toast({
        title: 'Request failed',
        description: (err as Error).message || 'Unable to process password reset',
        variant: 'destructive',
      });
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
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Enter your account email to receive a reset link
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-agri-600 dark:bg-agri-900/40">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                  We have sent password reset instructions to your email address if it is registered in our system.
                </p>
                <div className="pt-4">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="you@example.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-agri-600 hover:bg-agri-700 h-11"
                  disabled={loading}
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/auth/login"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" /> Return to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
