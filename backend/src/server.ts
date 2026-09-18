import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import {
  analyzeResumeSchema,
  mockInterviewTurnSchema,
  matchJDSchema,
  barRaiserScorecardSchema,
  chatAgentSchema,
} from './schemas/apiSchemas.js';
import { validateBody } from './middleware/validator.js';
import { llmCache } from './services/cacheService.js';
import {
  getMockResumeAnalysis,
  getMockInterviewTurn,
  getMockScorecard,
} from './services/mockFallbackService.js';
import {
  analyzeResumeWithGemini,
  conductMockInterviewTurn,
  chatWithCareerAgent,
  matchJobDescriptionWithGemini,
  generateBarRaiserScorecardWithGemini,
} from './services/geminiService.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Permit frontend cross-origin access
  })
);

// 2. CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

// 3. Body Parser
app.use(express.json({ limit: '10mb' }));

// 4. Rate Limiting for API Protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // 120 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again in a few minutes.',
  },
});
app.use('/api/', apiLimiter);

// Helper to determine if we should execute in live or fallback demo mode
function shouldRunInDemoMode(req: express.Request): boolean {
  const explicitDemo = req.headers['x-demo-mode'] === 'true' || req.query.demo === 'true';
  const apiKey = process.env.GEMINI_API_KEY;
  const missingOrDummyKey = !apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '';
  return explicitDemo || missingOrDummyKey;
}

// Telemetry generator
function generateTelemetry(startTime: number, mode: 'live' | 'demo', cached = false) {
  return {
    latencyMs: Date.now() - startTime,
    executionMode: mode,
    cached,
    model: mode === 'live' ? 'gemini-2.5-flash' : 'sandbox-demo-v1',
    timestamp: new Date().toISOString(),
  };
}

// Health & Status check
app.get('/api/status', (req, res) => {
  const isDemo = shouldRunInDemoMode(req);
  res.json({
    status: 'online',
    service: 'career-copilot-backend',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    demoModeActive: isDemo,
    cacheStats: llmCache.getStats(),
    timestamp: new Date().toISOString(),
  });
});

// Analyze resume (with Zod validation, LRU caching, and failover)
app.post('/api/analyze-resume', validateBody(analyzeResumeSchema), async (req, res) => {
  const startTime = Date.now();
  const { resumeText, targetRole, targetCompany } = req.body;

  try {
    const isDemo = shouldRunInDemoMode(req);
    const cacheKey = llmCache.hashKey('resume', { resumeText, targetRole, targetCompany, isDemo });

    // 1. Check LRU cache
    const cached = llmCache.get<any>(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        _meta: generateTelemetry(startTime, cached._meta?.executionMode || 'live', true),
      });
    }

    // 2. Fallback Demo Mode execution
    if (isDemo) {
      const demoResult = getMockResumeAnalysis(targetRole, targetCompany);
      const responseData = {
        ...demoResult,
        _meta: generateTelemetry(startTime, 'demo', false),
      };
      llmCache.set(cacheKey, responseData);
      return res.json(responseData);
    }

    // 3. Live Gemini API execution with graceful degradation
    try {
      const liveResult = await analyzeResumeWithGemini(resumeText, targetRole, targetCompany);
      const responseData = {
        ...liveResult,
        _meta: generateTelemetry(startTime, 'live', false),
      };
      llmCache.set(cacheKey, responseData);
      return res.json(responseData);
    } catch (geminiError: any) {
      console.warn('Gemini API failed, gracefully falling back to Recruiter Demo Mode:', geminiError?.message);
      const fallbackResult = getMockResumeAnalysis(targetRole, targetCompany);
      const fallbackResponse = {
        ...fallbackResult,
        _meta: generateTelemetry(startTime, 'demo', false),
        _degraded: true,
      };
      return res.json(fallbackResponse);
    }
  } catch (err: any) {
    console.error('Error in /api/analyze-resume:', err);
    res.status(500).json({ error: err?.message || 'Failed to analyze resume' });
  }
});

// Mock interview turn (with Zod validation and failover)
app.post('/api/mock-interview-turn', validateBody(mockInterviewTurnSchema), async (req, res) => {
  const startTime = Date.now();
  const { company, role, interviewType, history, latestUserResponse, difficulty, interviewerName } = req.body;

  try {
    const isDemo = shouldRunInDemoMode(req);

    if (isDemo) {
      const demoResult = getMockInterviewTurn(role, company, history, latestUserResponse);
      return res.json({
        ...demoResult,
        _meta: generateTelemetry(startTime, 'demo', false),
      });
    }

    try {
      const liveResult = await conductMockInterviewTurn(
        company,
        role,
        interviewType,
        history,
        latestUserResponse,
        difficulty,
        interviewerName
      );
      return res.json({
        ...liveResult,
        _meta: generateTelemetry(startTime, 'live', false),
      });
    } catch (geminiError: any) {
      console.warn('Gemini turn failed, falling back to mock:', geminiError?.message);
      const fallback = getMockInterviewTurn(role, company, history, latestUserResponse);
      return res.json({
        ...fallback,
        _meta: generateTelemetry(startTime, 'demo', false),
        _degraded: true,
      });
    }
  } catch (err: any) {
    console.error('Error running mock interview turn:', err);
    res.status(500).json({ error: err?.message || 'Failed to run mock interview turn' });
  }
});

// Match Job Description against Resume (with Zod validation and caching)
app.post('/api/match-jd', validateBody(matchJDSchema), async (req, res) => {
  const startTime = Date.now();
  const { resumeText, jobDescriptionText, targetRole, targetCompany } = req.body;

  try {
    const isDemo = shouldRunInDemoMode(req);
    const cacheKey = llmCache.hashKey('match-jd', { resumeText, jobDescriptionText, targetRole, targetCompany, isDemo });

    const cached = llmCache.get<any>(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        _meta: generateTelemetry(startTime, cached._meta?.executionMode || 'live', true),
      });
    }

    if (isDemo) {
      const demoResult = getMockResumeAnalysis(targetRole, targetCompany);
      const responseData = {
        matchScore: demoResult.overallScore,
        matchLevel: demoResult.matchLevel,
        summary: `Job Description match analysis completed. High congruence with core requirements. ${demoResult.summary}`,
        matchedKeywords: demoResult.matchedSkills,
        missingKeywords: demoResult.missingSkills.map((s) => s.skill),
        recommendations: demoResult.actionableImprovements.map((a) => a.description),
        _meta: generateTelemetry(startTime, 'demo', false),
      };
      llmCache.set(cacheKey, responseData);
      return res.json(responseData);
    }

    try {
      const liveResult = await matchJobDescriptionWithGemini(
        resumeText,
        jobDescriptionText,
        targetRole,
        targetCompany
      );
      const responseData = {
        ...liveResult,
        _meta: generateTelemetry(startTime, 'live', false),
      };
      llmCache.set(cacheKey, responseData);
      return res.json(responseData);
    } catch (geminiError: any) {
      console.warn('Gemini JD match failed, falling back to mock:', geminiError?.message);
      const demo = getMockResumeAnalysis(targetRole, targetCompany);
      return res.json({
        matchScore: 82,
        matchLevel: 'Good Match',
        summary: 'Fallback match analysis completed with high alignment.',
        matchedKeywords: demo.matchedSkills,
        missingKeywords: demo.missingSkills.map((s) => s.skill),
        recommendations: demo.actionableImprovements.map((a) => a.description),
        _meta: generateTelemetry(startTime, 'demo', false),
        _degraded: true,
      });
    }
  } catch (err: any) {
    console.error('Error matching job description:', err);
    res.status(500).json({ error: err?.message || 'Failed to match job description' });
  }
});

// Bar Raiser scorecard (with Zod validation and failover)
app.post('/api/bar-raiser-scorecard', validateBody(barRaiserScorecardSchema), async (req, res) => {
  const startTime = Date.now();
  const { company, role, transcript, interviewerName, difficulty } = req.body;

  try {
    const isDemo = shouldRunInDemoMode(req);

    if (isDemo) {
      const demoResult = getMockScorecard(company, role);
      return res.json({
        ...demoResult,
        _meta: generateTelemetry(startTime, 'demo', false),
      });
    }

    try {
      const liveResult = await generateBarRaiserScorecardWithGemini(
        company,
        role,
        transcript,
        interviewerName,
        difficulty
      );
      return res.json({
        ...liveResult,
        _meta: generateTelemetry(startTime, 'live', false),
      });
    } catch (geminiError: any) {
      console.warn('Gemini scorecard failed, falling back to mock:', geminiError?.message);
      const fallback = getMockScorecard(company, role);
      return res.json({
        ...fallback,
        _meta: generateTelemetry(startTime, 'demo', false),
        _degraded: true,
      });
    }
  } catch (err: any) {
    console.error('Error generating Bar Raiser scorecard:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate Bar Raiser scorecard' });
  }
});

// Multi-Agent Chat
app.post('/api/chat-agent', validateBody(chatAgentSchema), async (req, res) => {
  const startTime = Date.now();
  const { agentId, message, history } = req.body;

  try {
    const isDemo = shouldRunInDemoMode(req);

    if (isDemo) {
      const reply = `[Sandbox Coach] That is an insightful observation regarding your career trajectory. To maximize your competitive advantage as a senior practitioner, ensure every project you showcase highlights quantifiable engineering decisions, latency or reliability enhancements, and clear architectural leadership.`;
      return res.json({
        reply,
        _meta: generateTelemetry(startTime, 'demo', false),
      });
    }

    try {
      const reply = await chatWithCareerAgent(agentId, message, history);
      return res.json({
        reply,
        _meta: generateTelemetry(startTime, 'live', false),
      });
    } catch (geminiError: any) {
      return res.json({
        reply: `[Fallback Coach] I am operating in fail-safe mode. Focusing on strong systems fundamentals, STAR-based interview responses, and quantifiable impact will always distinguish you in technical reviews.`,
        _meta: generateTelemetry(startTime, 'demo', false),
      });
    }
  } catch (err: any) {
    console.error('Error in agent chat:', err);
    res.status(500).json({ error: err?.message || 'Failed to chat with agent' });
  }
});

// Start listening if executed directly (not when required by tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Career Copilot Backend running on http://localhost:${PORT}`);
  });
}
