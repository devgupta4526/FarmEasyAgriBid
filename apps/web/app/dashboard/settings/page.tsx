'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { userApi, authApi } from '@/lib/api';
import { Settings, User, Lock, Bell, Shield, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user, accessToken, updateUser, setUser } = useAuthStore();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (accessToken && !user) {
      authApi.me(accessToken)
        .then((res: any) => {
          if (res?.user) {
            setUser(res.user);
            setFullName(res.user.full_name || '');
            setEmail(res.user.email || '');
            setPhone(res.user.phone || '');
          }
        })
        .catch(() => {});
    }
  }, [accessToken, user, setUser]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }

    setSavingProfile(true);
    try {
      await userApi.updateProfile({ full_name: fullName, phone }, accessToken);
      updateUser({ full_name: fullName, phone });
      toast({ title: 'Profile updated successfully' });
    } catch (err) {
      toast({
        title: 'Profile Update Failed',
        description: (err as Error).message || 'Could not update profile details.',
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      toast({ title: 'Please enter both current and new password', variant: 'destructive' });
      return;
    }
    if (!accessToken) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.updatePassword(
        { current_password: currentPass, new_password: newPass },
        accessToken
      );
      setCurrentPass('');
      setNewPass('');
      toast({ title: 'Password changed successfully' });
    } catch (err) {
      toast({
        title: 'Password Update Failed',
        description: (err as Error).message || 'Failed to change password.',
        variant: 'destructive',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-agri-600" />
          Account Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal details, security settings, and notifications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Nav Tabs */}
        <Card className="md:col-span-1 border-0 shadow-sm h-fit">
          <CardContent className="p-3 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-agri-100 dark:bg-agri-900/40 text-agri-800 dark:text-agri-200">
              <User className="h-4 w-4" /> Personal Information
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted">
              <Lock className="h-4 w-4" /> Security & Password
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted">
              <Bell className="h-4 w-4" /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted">
              <Shield className="h-4 w-4" /> Privacy & KYC
            </button>
          </CardContent>
        </Card>

        {/* Content Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Update your display name and contact preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-10 px-3 rounded-xl border bg-muted text-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" className="bg-agri-600 hover:bg-agri-700" disabled={savingProfile}>
                  <Check className="h-4 w-4 mr-2" /> {savingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Security & Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSave} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <Button type="submit" variant="outline" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
