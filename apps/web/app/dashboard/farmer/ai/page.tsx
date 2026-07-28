'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, TrendingUp, ShieldAlert, Leaf, ArrowRight } from 'lucide-react';

export default function FarmerAiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-agri-600" />
          AI Farmer Advisory Portal
        </h1>
        <p className="text-muted-foreground text-sm">
          Google Gemini AI insights tailored for pricing, crop health, disease diagnosis, and demand forecasting
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 text-agri-700 dark:text-agri-300 rounded-xl w-fit">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Crop Price Advisor</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get real-time market price estimations based on historical data and current demand trends.
              </p>
            </div>
            <Link href="/ai">
              <Button className="w-full bg-agri-600 hover:bg-agri-700">
                Launch Price Advisor <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl w-fit">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Crop Selection Advisor</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Analyze soil type, region, and seasonal forecasts to select optimal high-yield crops.
              </p>
            </div>
            <Link href="/ai">
              <Button variant="outline" className="w-full">
                Launch Crop Advisor <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-xl w-fit">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pest & Disease Assistant</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Diagnose crop diseases instantly by describing symptoms or uploading crop photos.
              </p>
            </div>
            <Link href="/ai">
              <Button variant="outline" className="w-full">
                Diagnose Disease <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl w-fit">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AgriAI Multilingual Assistant</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ask farming queries in Hindi, English, Punjabi, or 6+ regional Indian languages.
              </p>
            </div>
            <Link href="/ai">
              <Button variant="outline" className="w-full">
                Open AI Chatbot <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
