import { Router } from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { query } from '../db/pool';
import { logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';

const router = Router();

// Stricter rate limiting for AI endpoints (free tier)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: { error: 'AI request limit reached. Try again in an hour.' },
});

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  if (!genAI) throw new Error('Gemini AI not configured');

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings: SAFETY_SETTINGS,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function logAIRequest(
  userId: string | undefined,
  feature: string,
  input: unknown,
  response: unknown,
  start: number
): Promise<void> {
  if (!userId) return;
  try {
    await query(
      `INSERT INTO ai_requests (user_id, feature, input_data, response_data, latency_ms)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, feature, JSON.stringify(input), JSON.stringify({ response }), Date.now() - start]
    );
  } catch (err) {
    logger.error('Failed to log AI request', { error: (err as Error).message });
  }
}

// POST /ai/price-advisor
router.post('/price-advisor', authenticate, aiLimiter, async (req: AuthRequest, res) => {
  const { crop, quantity, unit, location, quality_grade, is_organic } = req.body;
  if (!crop) return res.status(422).json({ error: 'Crop name is required' });

  const start = Date.now();
  try {
    const prompt = `
You are an expert agricultural price advisor for Indian markets.
Provide a JSON response (no markdown) for:
- Crop: ${crop}
- Quantity: ${quantity || 'unspecified'} ${unit || 'kg'}
- Location: ${location || 'India'}
- Quality Grade: ${quality_grade || 'standard'}
- Organic: ${is_organic ? 'Yes (certified organic)' : 'No'}

Return ONLY valid JSON with this structure:
{
  "current_market_price": { "min": number, "max": number, "avg": number, "unit": "per kg" },
  "recommended_price": number,
  "profit_margin_estimate": "15-25%",
  "demand_level": "high|medium|low",
  "price_trend": "rising|stable|falling",
  "best_time_to_sell": "string",
  "nearby_mandis": ["mandi name with city"],
  "insights": ["insight 1", "insight 2", "insight 3"]
}`;

    const text = await callGemini(prompt, 'You are an agricultural market pricing expert. Always respond in valid JSON.');
    const data = JSON.parse(text);
    await logAIRequest(req.user?.id, 'price_advisor', req.body, data, start);
    return res.json({ data });
  } catch (err) {
    logger.error('Price advisor error', { error: (err as Error).message });
    return res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// POST /ai/crop-advisor
router.post('/crop-advisor', authenticate, aiLimiter, async (req: AuthRequest, res) => {
  const { location, soil_type, season, previous_crop, budget, area_acres } = req.body;
  if (!location) return res.status(422).json({ error: 'Location is required' });

  const start = Date.now();
  try {
    const prompt = `
You are an expert agricultural crop advisor for India.
Context:
- Location: ${location}
- Soil type: ${soil_type || 'unknown'}
- Season/Month: ${season || 'current season'}
- Previous crop: ${previous_crop || 'none'}
- Budget: ₹${budget || 'flexible'} per acre
- Land: ${area_acres || 1} acres

Return ONLY valid JSON:
{
  "recommended_crops": [
    {
      "name": "crop name",
      "expected_yield_kg_per_acre": number,
      "expected_revenue_per_acre": number,
      "investment_per_acre": number,
      "profit_estimate": number,
      "growing_days": number,
      "water_requirement": "low|medium|high",
      "disease_risk": "low|medium|high",
      "market_demand": "high|medium|low",
      "reason": "why this crop is recommended"
    }
  ],
  "weather_advisory": "string",
  "soil_preparation": ["step1", "step2"],
  "general_tips": ["tip1", "tip2"]
}`;

    const text = await callGemini(prompt, 'You are an expert Indian agricultural advisor. Respond only in valid JSON.');
    const data = JSON.parse(text);
    await logAIRequest(req.user?.id, 'crop_advisor', req.body, data, start);
    return res.json({ data });
  } catch (err) {
    logger.error('Crop advisor error', { error: (err as Error).message });
    return res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// POST /ai/disease-assistant
router.post('/disease-assistant', authenticate, aiLimiter, async (req: AuthRequest, res) => {
  const { crop, symptoms, image_description } = req.body;
  if (!crop || !symptoms) {
    return res.status(422).json({ error: 'Crop and symptoms are required' });
  }

  const start = Date.now();
  try {
    const prompt = `
Agricultural disease diagnosis:
- Crop: ${crop}
- Symptoms: ${symptoms}
- Visual description: ${image_description || 'not provided'}

Return ONLY valid JSON:
{
  "possible_diseases": [
    {
      "name": "disease name",
      "confidence": "high|medium|low",
      "symptoms_match": ["matched symptom"],
      "cause": "pathogen or environmental cause",
      "severity": "mild|moderate|severe",
      "treatment": {
        "organic": ["organic treatment steps"],
        "chemical": ["chemical treatment with dosage"],
        "preventive": ["prevention measures"]
      },
      "spread_risk": "string"
    }
  ],
  "immediate_action": "what to do right now",
  "recovery_timeline": "estimated recovery time",
  "expert_consultation_needed": true/false
}`;

    const text = await callGemini(prompt, 'You are an expert plant pathologist. Respond only in valid JSON.');
    const data = JSON.parse(text);
    await logAIRequest(req.user?.id, 'disease_assistant', req.body, data, start);
    return res.json({ data });
  } catch (err) {
    logger.error('Disease assistant error', { error: (err as Error).message });
    return res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// POST /ai/market-forecast
router.post('/market-forecast', authenticate, aiLimiter, async (req: AuthRequest, res) => {
  const { category, location, months = 3 } = req.body;

  const start = Date.now();
  try {
    const prompt = `
Agricultural market forecast for India:
- Category: ${category || 'all vegetables and fruits'}
- Location: ${location || 'India'}
- Forecast period: next ${months} months

Return ONLY valid JSON:
{
  "high_demand_crops": [{"name": string, "expected_price_range": string, "reason": string}],
  "expected_shortages": [{"crop": string, "severity": string, "reason": string}],
  "expected_oversupply": [{"crop": string, "price_drop_percent": number, "reason": string}],
  "festival_demand": [{"festival": string, "date": string, "high_demand_items": [string]}],
  "seasonal_insights": ["insight 1", "insight 2"],
  "export_opportunities": [{"crop": string, "destination": string, "price_premium": string}],
  "weather_impact": "string",
  "overall_market_sentiment": "bullish|neutral|bearish"
}`;

    const text = await callGemini(prompt, 'You are an Indian agricultural market analyst. Respond only in valid JSON.');
    const data = JSON.parse(text);
    await logAIRequest(req.user?.id, 'market_forecast', req.body, data, start);
    return res.json({ data });
  } catch (err) {
    logger.error('Market forecast error', { error: (err as Error).message });
    return res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// POST /ai/chat
router.post('/chat', authenticate, aiLimiter, async (req: AuthRequest, res) => {
  const { message, language = 'en', context } = req.body;
  if (!message?.trim()) return res.status(422).json({ error: 'Message is required' });

  const languageNames: Record<string, string> = {
    en: 'English', hi: 'Hindi', mr: 'Marathi', gu: 'Gujarati',
    kn: 'Kannada', ta: 'Tamil', te: 'Telugu', pa: 'Punjabi', bn: 'Bengali'
  };

  const start = Date.now();
  try {
    const systemPrompt = `You are AgriBid Assistant, a helpful AI for the AgriBid farmer marketplace.
You help farmers and buyers with:
- Crop information and growing tips
- Market prices and auction guidance
- Order and payment help
- Platform features explanation
- Agricultural best practices

Always respond in ${languageNames[language] || 'English'}.
Be concise, friendly, and practical. Use simple language appropriate for farmers.
If asked about prices, mention that prices vary and they should use the Price Advisor for accurate data.
Never give harmful advice. If you don't know something specific, say so honestly.
${context ? `User context: ${context}` : ''}`;

    const text = await callGemini(message, systemPrompt);
    await logAIRequest(req.user?.id, 'chat', { message, language }, text, start);
    return res.json({ response: text, language });
  } catch (err) {
    logger.error('AI chat error', { error: (err as Error).message });
    return res.status(500).json({ error: 'AI assistant temporarily unavailable' });
  }
});

export default router;
