import { Router } from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { query } from '../db/pool';
import { logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
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

function parseOrCleanJSON(text: string): any {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

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

// Fallback Generators
function getPriceAdvisorFallback(crop: string, unit = 'kg', location = 'India') {
  return {
    current_market_price: { min: 25, max: 45, avg: 35, unit: `per ${unit}` },
    recommended_price: 38,
    profit_margin_estimate: "20-30%",
    demand_level: "high",
    price_trend: "rising",
    best_time_to_sell: "Next 7-10 days due to high regional demand",
    nearby_mandis: [`${location} APMC Mandi`, "Azadpur Mandi", "Vashi APMC Market"],
    insights: [
      `Current market demand for ${crop} is steady across regional APMC hubs.`,
      "Quality grading and organic certification can command a 15-20% price premium.",
      "Direct buyer negotiations via AgriBid Escrow yield higher profit margins than local traders."
    ]
  };
}

function getCropAdvisorFallback(location: string, season = 'Kharif') {
  return {
    recommended_crops: [
      {
        name: "Organic Red Onion / Tomato",
        expected_yield_kg_per_acre: 12000,
        expected_revenue_per_acre: 240000,
        investment_per_acre: 60000,
        profit_estimate: 180000,
        growing_days: 90,
        water_requirement: "medium",
        disease_risk: "low",
        market_demand: "high",
        reason: `Highly suited for ${location} soil and current ${season} season climate.`
      },
      {
        name: "Basmati Rice / Wheat",
        expected_yield_kg_per_acre: 4500,
        expected_revenue_per_acre: 160000,
        investment_per_acre: 40000,
        profit_estimate: 120000,
        growing_days: 120,
        water_requirement: "high",
        disease_risk: "low",
        market_demand: "high",
        reason: "Consistent market demand with steady MSP backing."
      }
    ],
    weather_advisory: `Favorable seasonal weather expected in ${location}. Ensure proper field drainage.`,
    soil_preparation: [
      "Perform soil testing for NPK levels before sowing.",
      "Incorporate organic compost / vermicompost during land preparation."
    ],
    general_tips: [
      "Use certified disease-resistant seed varieties.",
      "Monitor soil moisture levels regularly."
    ]
  };
}

function getDiseaseAssistantFallback(crop: string, symptoms: string) {
  return {
    possible_diseases: [
      {
        name: `${crop} Leaf Spot / Blight`,
        confidence: "medium",
        symptoms_match: [symptoms || "Foliar discoloration"],
        cause: "Fungal pathogen or excess humidity",
        severity: "moderate",
        treatment: {
          organic: ["Apply Neem oil solution (5ml/L) or Trichoderma viride."],
          chemical: ["Spray Copper Oxychloride (3g/L) or Mancozeb."],
          preventive: ["Ensure field aeration and avoid overhead irrigation."]
        },
        spread_risk: "Moderate during high humidity."
      }
    ],
    immediate_action: "Isolate affected plants and apply recommended organic fungicide.",
    recovery_timeline: "7-14 days after treatment",
    expert_consultation_needed: false
  };
}

function getMarketForecastFallback(category: string, location: string) {
  return {
    high_demand_crops: [
      { name: "Red Onions", expected_price_range: "₹30 - ₹45/kg", reason: "Seasonal supply shortage" },
      { name: "Alphonso Mangoes", expected_price_range: "₹250 - ₹400/kg", reason: "Peak harvest season" }
    ],
    expected_shortages: [
      { crop: "Green Chillies", severity: "moderate", reason: "Unseasonal rain impact" }
    ],
    expected_oversupply: [
      { crop: "Tomatoes", price_drop_percent: 10, reason: "Bumper harvest in neighbouring districts" }
    ],
    festival_demand: [
      { festival: "Harvest Festival", date: "Upcoming Month", high_demand_items: ["Grains", "Pulses", "Fruits"] }
    ],
    seasonal_insights: [
      "APMC wholesale arrivals are expected to increase over the next 3 weeks.",
      "Direct farm-gate sales present the highest profit margin for farmers."
    ],
    export_opportunities: [
      { crop: "Basmati Rice", destination: "Middle East", price_premium: "25%" }
    ],
    weather_impact: `Normal seasonal conditions in ${location}.`,
    overall_market_sentiment: "bullish"
  };
}

function getAIChatFallback(message: string, language = 'en'): string {
  if (language === 'hi') {
    return "नमस्ते! मैं एग्रीबिड एआई सहायक हूँ। आप अपनी फसलों की कीमत, मौसम, और बाज़ार की जानकारी के लिए मुझसे पूछ सकते हैं।";
  }
  return "Hello! I am AgriBid Assistant. I can help you with crop market prices, crop recommendations, disease diagnosis, and buying/selling on AgriBid.";
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
    const data = parseOrCleanJSON(text);
    await logAIRequest(req.user?.id, 'price_advisor', req.body, data, start);
    return res.json({ data });
  } catch (err) {
    logger.warn('Price advisor Gemini error, returning rule-based fallback', { error: (err as Error).message });
    const data = getPriceAdvisorFallback(crop, unit, location);
    await logAIRequest(req.user?.id, 'price_advisor_fallback', req.body, data, start);
    return res.json({ data });
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
    const data = parseOrCleanJSON(text);
    await logAIRequest(req.user?.id, 'crop_advisor', req.body, data, start);
    return res.json({ data });
  } catch (err) {
    logger.warn('Crop advisor Gemini error, returning rule-based fallback', { error: (err as Error).message });
    const data = getCropAdvisorFallback(location, season);
    await logAIRequest(req.user?.id, 'crop_advisor_fallback', req.body, data, start);
    return res.json({ data });
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
    const data = parseOrCleanJSON(text);
    await logAIRequest(req.user?.id, 'disease_assistant', req.body, data, start);
    return res.json({ data });
  } catch (err) {
    logger.warn('Disease assistant Gemini error, returning fallback', { error: (err as Error).message });
    const data = getDiseaseAssistantFallback(crop, symptoms);
    await logAIRequest(req.user?.id, 'disease_assistant_fallback', req.body, data, start);
    return res.json({ data });
  }
});

// POST /ai/market-forecast
router.post('/market-forecast', authenticate, aiLimiter, async (req: AuthRequest, res) => {
  const { category, location } = req.body;

  const start = Date.now();
  try {
    const prompt = `
Agricultural market forecast for India:
- Category: ${category || 'all vegetables and fruits'}
- Location: ${location || 'India'}

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
    const data = parseOrCleanJSON(text);
    await logAIRequest(req.user?.id, 'market_forecast', req.body, data, start);
    return res.json({ data });
  } catch (err) {
    logger.warn('Market forecast Gemini error, returning fallback', { error: (err as Error).message });
    const data = getMarketForecastFallback(category, location);
    await logAIRequest(req.user?.id, 'market_forecast_fallback', req.body, data, start);
    return res.json({ data });
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
Always respond in ${languageNames[language] || 'English'}.
${context ? `User context: ${context}` : ''}`;

    const text = await callGemini(message, systemPrompt);
    await logAIRequest(req.user?.id, 'chat', { message, language }, text, start);
    return res.json({ response: text, language });
  } catch (err) {
    logger.warn('AI chat Gemini error, returning fallback', { error: (err as Error).message });
    const response = getAIChatFallback(message, language);
    await logAIRequest(req.user?.id, 'chat_fallback', { message, language }, response, start);
    return res.json({ response, language });
  }
});

export default router;
