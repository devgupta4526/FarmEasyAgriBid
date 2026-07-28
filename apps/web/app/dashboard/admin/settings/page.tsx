'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Platform settings saved' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-agri-600" />
          Global Platform Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure global platform parameters, commission rates, and feature toggles
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Commission & Fee Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Platform Commission Fee (%)</label>
              <input
                type="number"
                step="0.1"
                defaultValue="2.5"
                className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Default Auction Duration (Hours)</label>
              <input
                type="number"
                defaultValue="48"
                className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" className="bg-agri-600 hover:bg-agri-700">
              <Check className="h-4 w-4 mr-2" /> Save Global Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
