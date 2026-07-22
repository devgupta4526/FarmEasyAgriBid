'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { aiApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp, Leaf, Bug, BarChart3, MessageSquare,
  Bot, Send, RefreshCw, Loader2
} from 'lucide-react';

const features = [
  { id: 'price', label: 'Price Advisor', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'crop', label: 'Crop Advisor', icon: Leaf, color: 'text-agri-600' },
  { id: 'disease', label: 'Disease Assistant', icon: Bug, color: 'text-red-500' },
  { id: 'forecast', label: 'Market Forecast', icon: BarChart3, color: 'text-purple-500' },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'text-orange-500' },
] as const;

type FeatureId = typeof features[number]['id'];

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIAdvisorPage() {
  const { user, accessToken } = useAuthStore();
  const { toast } = useToast();
  const [activeFeature, setActiveFeature] = useState<FeatureId>('price');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Price Advisor state
  const [crop, setCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [qualityGrade, setQualityGrade] = useState('A');
  const [isOrganic, setIsOrganic] = useState(false);

  // Crop Advisor state
  const [soilType, setSoilType] = useState('');
  const [season, setSeason] = useState('');
  const [previousCrop, setPreviousCrop] = useState('');
  const [areaAcres, setAreaAcres] = useState('');

  // Disease Assistant state
  const [symptoms, setSymptoms] = useState('');
  const [imageDesc, setImageDesc] = useState('');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: 'Namaste! I\'m your AgriBid AI assistant. Ask me anything about crops, market prices, auctions, or agricultural practices. 🌾', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLanguage, setChatLanguage] = useState('en');

  const handlePriceAdvisor = async () => {
    if (!crop) { toast({ title: 'Enter crop name', variant: 'destructive' }); return; }
    if (!accessToken) { toast({ title: 'Please login', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const res = await aiApi.priceAdvisor({ crop, quantity, unit: 'kg', location, quality_grade: qualityGrade, is_organic: isOrganic }, accessToken) as { data: unknown };
      setResult(res.data);
    } catch (err) {
      toast({ title: 'AI unavailable', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCropAdvisor = async () => {
    if (!location) { toast({ title: 'Enter location', variant: 'destructive' }); return; }
    if (!accessToken) { toast({ title: 'Please login', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const res = await aiApi.cropAdvisor({ location, soil_type: soilType, season, previous_crop: previousCrop, area_acres: areaAcres }, accessToken) as { data: unknown };
      setResult(res.data);
    } catch (err) {
      toast({ title: 'AI unavailable', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDiseaseAssistant = async () => {
    if (!crop || !symptoms) { toast({ title: 'Enter crop and symptoms', variant: 'destructive' }); return; }
    if (!accessToken) { toast({ title: 'Please login', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const res = await aiApi.diseaseAssistant({ crop, symptoms, image_description: imageDesc }, accessToken) as { data: unknown };
      setResult(res.data);
    } catch (err) {
      toast({ title: 'AI unavailable', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarketForecast = async () => {
    if (!accessToken) { toast({ title: 'Please login', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const res = await aiApi.marketForecast({ location, category: crop }, accessToken) as { data: unknown };
      setResult(res.data);
    } catch (err) {
      toast({ title: 'AI unavailable', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !accessToken) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput, timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat({ message: chatInput, language: chatLanguage }, accessToken) as { response: string };
      const aiMsg: ChatMessage = { role: 'ai', content: res.response, timestamp: new Date() };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = { role: 'ai', content: 'Sorry, I\'m having trouble right now. Please try again.', timestamp: new Date() };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी' },
    { value: 'mr', label: 'मराठी' }, { value: 'gu', label: 'ગુજરાતી' },
    { value: 'kn', label: 'ಕನ್ನಡ' }, { value: 'ta', label: 'தமிழ்' },
    { value: 'te', label: 'తెలుగు' }, { value: 'pa', label: 'ਪੰਜਾਬੀ' },
    { value: 'bn', label: 'বাংলা' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-agri-50 to-background dark:from-agri-950/30 py-10 border-b">
        <div className="page-container text-center">
          <div className="inline-flex items-center gap-2 bg-agri-100 dark:bg-agri-900/40 text-agri-700 dark:text-agri-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Bot className="h-4 w-4" /> Powered by Google Gemini
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Agricultural Advisor</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Get real-time market insights, crop recommendations, disease diagnosis, and farming guidance.
          </p>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Feature Nav */}
          <aside>
            <nav className="space-y-1">
              {features.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setActiveFeature(f.id); setResult(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeFeature === f.id
                      ? 'bg-agri-100 text-agri-700 dark:bg-agri-900/30 dark:text-agri-300'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                  {f.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* PRICE ADVISOR */}
            {activeFeature === 'price' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" /> Price Advisor
                  </CardTitle>
                  <CardDescription>Get current market price estimates and selling recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Crop Name *</label>
                      <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Tomatoes, Onions" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Location</label>
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nashik, Maharashtra" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Quantity (kg)</label>
                      <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" placeholder="100" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Quality Grade</label>
                      <select value={qualityGrade} onChange={(e) => setQualityGrade(e.target.value)} className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none">
                        <option value="A">Grade A</option>
                        <option value="B">Grade B</option>
                        <option value="premium">Premium</option>
                        <option value="export">Export</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isOrganic} onChange={(e) => setIsOrganic(e.target.checked)} />
                    <span className="text-sm">🌿 Certified Organic</span>
                  </label>
                  <Button onClick={handlePriceAdvisor} disabled={loading} className="bg-agri-600 hover:bg-agri-700">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</> : '🔍 Get Price Analysis'}
                  </Button>

                  {/* Result */}
                  {result && (() => {
                    const r = result as {
                      current_market_price?: { min: number; max: number; avg: number; unit: string };
                      recommended_price?: number;
                      demand_level?: string;
                      price_trend?: string;
                      best_time_to_sell?: string;
                      insights?: string[];
                      nearby_mandis?: string[];
                    };
                    return (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          {r.current_market_price && (
                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                              <CardContent className="p-4 text-center">
                                <p className="text-xs text-muted-foreground">Market Range</p>
                                <p className="text-lg font-bold text-blue-600">{formatCurrency(r.current_market_price.min)} – {formatCurrency(r.current_market_price.max)}</p>
                                <p className="text-xs text-muted-foreground">{r.current_market_price.unit}</p>
                              </CardContent>
                            </Card>
                          )}
                          {r.recommended_price && (
                            <Card className="bg-agri-50 dark:bg-agri-900/20 border-agri-200">
                              <CardContent className="p-4 text-center">
                                <p className="text-xs text-muted-foreground">Recommended Price</p>
                                <p className="text-lg font-bold text-agri-600">{formatCurrency(r.recommended_price)}</p>
                                <p className="text-xs text-muted-foreground">per kg</p>
                              </CardContent>
                            </Card>
                          )}
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground">Demand</p>
                              <p className={`text-lg font-bold capitalize ${r.demand_level === 'high' ? 'text-agri-600' : r.demand_level === 'low' ? 'text-red-500' : 'text-yellow-500'}`}>{r.demand_level}</p>
                              <p className="text-xs text-muted-foreground capitalize">Trend: {r.price_trend}</p>
                            </CardContent>
                          </Card>
                        </div>
                        {r.insights && (
                          <Card>
                            <CardContent className="p-4">
                              <p className="font-medium mb-2">Market Insights</p>
                              <ul className="space-y-1">
                                {r.insights.map((i, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-agri-600 mt-0.5">•</span>{i}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </motion.div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* AI CHAT */}
            {activeFeature === 'chat' && (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-agri-100 dark:bg-agri-900/40 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-agri-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">AgriBid AI Assistant</CardTitle>
                        <div className="flex items-center gap-1 text-xs text-agri-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-agri-600 animate-pulse" />
                          Online
                        </div>
                      </div>
                    </div>
                    <select value={chatLanguage} onChange={(e) => setChatLanguage(e.target.value)} className="h-8 px-2 rounded-lg border bg-background text-xs">
                      {languages.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </CardHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                      {msg.role === 'ai' && (
                        <div className="h-7 w-7 rounded-full bg-agri-100 dark:bg-agri-900/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="h-3.5 w-3.5 text-agri-600" />
                        </div>
                      )}
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-agri-600 text-white' : 'bg-muted'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start gap-2">
                      <div className="h-7 w-7 rounded-full bg-agri-100 dark:bg-agri-900/40 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-agri-600" />
                      </div>
                      <div className="bg-muted px-4 py-2.5 rounded-2xl">
                        <div className="flex gap-1">
                          {[0,1,2].map((i) => <div key={i} className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                      placeholder="Ask about crops, prices, auctions..."
                      className="flex-1 h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={loading || !accessToken}
                    />
                    <Button onClick={sendChatMessage} disabled={loading || !chatInput.trim() || !accessToken} className="bg-agri-600 hover:bg-agri-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {!accessToken && <p className="text-xs text-muted-foreground mt-2 text-center">Please login to use AI Assistant</p>}
                </div>
              </Card>
            )}

            {/* CROP ADVISOR - simplified */}
            {activeFeature === 'crop' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-agri-600" /> Crop Advisor</CardTitle>
                  <CardDescription>Get personalized crop recommendations for your location and season</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Location *</label>
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Pune, Maharashtra" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Soil Type</label>
                      <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none">
                        <option value="">Select soil type</option>
                        <option value="clay">Clay</option>
                        <option value="loamy">Loamy</option>
                        <option value="sandy">Sandy</option>
                        <option value="black_cotton">Black Cotton</option>
                        <option value="red">Red Soil</option>
                        <option value="alluvial">Alluvial</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Current Season / Month</label>
                      <input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="e.g. Rabi, December" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Area (acres)</label>
                      <input value={areaAcres} onChange={(e) => setAreaAcres(e.target.value)} type="number" placeholder="e.g. 2" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <Button onClick={handleCropAdvisor} disabled={loading} className="bg-agri-600 hover:bg-agri-700">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</> : '🌱 Get Crop Recommendations'}
                  </Button>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <pre className="text-xs bg-muted p-4 rounded-xl overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* DISEASE ASSISTANT */}
            {activeFeature === 'disease' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bug className="h-5 w-5 text-red-500" /> Disease Assistant</CardTitle>
                  <CardDescription>Describe symptoms to identify plant diseases and get treatment advice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Affected Crop *</label>
                    <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Tomato, Wheat" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Describe Symptoms *</label>
                    <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. Yellow spots on leaves, wilting stems, brown patches..." rows={3} className="w-full px-3 py-2 rounded-xl border bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Visual Description (optional)</label>
                    <input value={imageDesc} onChange={(e) => setImageDesc(e.target.value)} placeholder="Describe what you see on the plant..." className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <Button onClick={handleDiseaseAssistant} disabled={loading} className="bg-red-500 hover:bg-red-600">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Diagnosing...</> : '🔬 Diagnose Disease'}
                  </Button>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <pre className="text-xs bg-muted p-4 rounded-xl overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* MARKET FORECAST */}
            {activeFeature === 'forecast' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-purple-500" /> Market Forecast</CardTitle>
                  <CardDescription>AI-powered demand forecasts, shortage predictions, and festival pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Category (optional)</label>
                      <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Vegetables, Fruits" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Region</label>
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Maharashtra, India" className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <Button onClick={handleMarketForecast} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Forecasting...</> : '📈 Generate Market Forecast'}
                  </Button>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <pre className="text-xs bg-muted p-4 rounded-xl overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
