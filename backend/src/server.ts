import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {
  analyzeResumeWithGemini,
  conductMockInterviewTurn,
  chatWithCareerAgent,
  matchJobDescriptionWithGemini,
  generateBarRaiserScorecardWithGemini,
} from './services/geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health & Status check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'career-copilot-backend',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Analyze resume
app.post('/api/analyze-resume', async (req, res) => {
  try {
    const { resumeText, targetRole, targetCompany } = req.body || {};
    const result = await analyzeResumeWithGemini(
      resumeText || '',
      targetRole || 'Senior Solutions Architect',
      targetCompany
    );
    res.json(result);
  } catch (err: any) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({ error: err?.message || 'Failed to analyze resume' });
  }
});

// Mock interview turn
app.post('/api/mock-interview-turn', async (req, res) => {
  try {
    const { company, role, interviewType, history, latestUserResponse, difficulty, interviewerName } = req.body || {};
    const result = await conductMockInterviewTurn(
      company || 'Google',
      role || 'Senior Product Manager',
      interviewType || 'Behavioral (Leadership)',
      history || [],
      latestUserResponse,
      difficulty || 'Senior',
      interviewerName || 'Alex Rivera'
    );
    res.json(result);
  } catch (err: any) {
    console.error('Error running mock interview turn:', err);
    res.status(500).json({ error: err?.message || 'Failed to run mock interview turn' });
  }
});

// Match Job Description against Resume
app.post('/api/match-jd', async (req, res) => {
  try {
    const { resumeText, jobDescriptionText, targetRole, targetCompany } = req.body || {};
    const result = await matchJobDescriptionWithGemini(
      resumeText || '',
      jobDescriptionText || '',
      targetRole || 'Senior Role',
      targetCompany
    );
    res.json(result);
  } catch (err: any) {
    console.error('Error matching job description:', err);
    res.status(500).json({ error: err?.message || 'Failed to match job description' });
  }
});

// Generate Bar Raiser final decision & scorecard
app.post('/api/bar-raiser-scorecard', async (req, res) => {
  try {
    const { company, role, transcript, interviewerName, difficulty } = req.body || {};
    const result = await generateBarRaiserScorecardWithGemini(
      company || 'Google',
      role || 'Senior Candidate',
      transcript || [],
      interviewerName || 'Bar Raiser',
      difficulty || 'Senior'
    );
    res.json(result);
  } catch (err: any) {
    console.error('Error generating Bar Raiser scorecard:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate Bar Raiser scorecard' });
  }
});

// Multi-Agent Chat
app.post('/api/chat-agent', async (req, res) => {
  try {
    const { agentId, message, history } = req.body || {};
    const reply = await chatWithCareerAgent(agentId || 'resume', message || '', history || []);
    res.json({ reply });
  } catch (err: any) {
    console.error('Error in agent chat:', err);
    res.status(500).json({ error: err?.message || 'Failed to chat with agent' });
  }
});

app.listen(PORT, () => {
  console.log(`Career Copilot Backend running on http://localhost:${PORT}`);
});
