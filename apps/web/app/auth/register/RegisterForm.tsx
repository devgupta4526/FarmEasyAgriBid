'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Tractor, ShoppingCart, Truck, Leaf } from 'lucide-react';

const schema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid Indian mobile number').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
    role: z.enum(['farmer', 'buyer', 'logistics']),
    referral_code: z.string().optional(),
}).refine((d) => d.email || d.phone, {
    message: 'Email or phone is required',
    path: ['email'],
}).refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

const roles = [
    { value: 'farmer', label: 'Farmer', icon: Tractor, desc: 'Sell produce & run auctions' },
    { value: 'buyer', label: 'Buyer', icon: ShoppingCart, desc: 'Buy direct from farms' },
    { value: 'logistics', label: 'Logistics', icon: Truck, desc: 'Deliver farm orders' },
] as const;

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRole = (searchParams.get('role') || 'buyer') as 'farmer' | 'buyer' | 'logistics';
    const { login } = useAuthStore();
    const { toast } = useToast();
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { role: initialRole },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const res = await authApi.register({
                full_name: data.full_name,
                email: data.email || undefined,
                phone: data.phone || undefined,
                password: data.password,
                role: data.role,
                referral_code: data.referral_code,
            }) as { user: { id: string; email: string | null; phone: string | null; role: string; status: string; full_name: string; email_verified: boolean; phone_verified: boolean }; access_token: string; refresh_token: string };

            login(res.user as Parameters<typeof login>[0], res.access_token, res.refresh_token);
            toast({ title: 'Welcome to AgriBid! 🌾', description: 'Account created successfully.' });
            router.push(`/dashboard/${data.role}`);
        } catch (err) {
            toast({ title: 'Registration failed', description: (err as Error).message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-agri-50 via-background to-earth-50 dark:from-agri-950/30 dark:to-earth-950/30">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-agri-600">
                            <Leaf className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-2xl">AgriBid</span>
                    </div>
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-muted-foreground text-sm mt-1.5">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-agri-600 hover:underline font-medium">Sign in</Link>
                    </p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardContent className="p-8 space-y-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                            {/* Role Selection */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">I am a...</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {roles.map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setValue('role', r.value)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm transition-all ${selectedRole === r.value
                                                    ? 'border-agri-500 bg-agri-50 dark:bg-agri-900/30 text-agri-700 dark:text-agri-300'
                                                    : 'border-border hover:border-muted-foreground/30'
                                                }`}
                                        >
                                            <r.icon className="h-5 w-5" />
                                            <span className="font-medium">{r.label}</span>
                                            <span className="text-xs text-muted-foreground text-center leading-tight">{r.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block" htmlFor="full_name">Full Name</label>
                                <input
                                    id="full_name"
                                    type="text"
                                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Rajesh Kumar"
                                    {...register('full_name')}
                                />
                                {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="you@example.com"
                                    {...register('email')}
                                />
                                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block" htmlFor="password">Password</label>
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
                                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block" htmlFor="confirm_password">Confirm Password</label>
                                <input
                                    id="confirm_password"
                                    type="password"
                                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="••••••••"
                                    {...register('confirm_password')}
                                />
                                {errors.confirm_password && <p className="text-xs text-destructive mt-1">{errors.confirm_password.message}</p>}
                            </div>

                            {/* Referral Code */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block" htmlFor="referral_code">
                                    Referral Code <span className="text-muted-foreground font-normal">(optional)</span>
                                </label>
                                <input
                                    id="referral_code"
                                    type="text"
                                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Enter referral code"
                                    {...register('referral_code')}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-agri-600 hover:bg-agri-700 h-11"
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                By registering, you agree to our{' '}
                                <Link href="/terms" className="text-agri-600 hover:underline">Terms of Service</Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-agri-600 hover:underline">Privacy Policy</Link>.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
