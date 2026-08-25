import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  analyzeResumeWithGemini,
  conductMockInterviewTurn,
  chatWithCareerAgent,
  matchJobDescriptionWithGemini,
  generateBarRaiserScorecardWithGemini,
} from './server/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
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
    res.status(500).json({ error: err?.message || 'Failed to analyze resume' });
  }
});

// Mock interview
app.post('/api/mock-interview-turn', async (req, res) => {
  try {
    const { company, role, interviewType, history, latestUserResponse, difficulty, interviewerName } = req.body || {};
    const result = await conductMockInterviewTurn(
      company || 'Google',
      role || 'Senior Product Manager',
      interviewType || 'Behavioral (Leadership)',
      history || [],
      latestUserResponse,
      difficulty,
      interviewerName
    );
    res.json(result);
  } catch (err: any) {
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
    res.status(500).json({ error: err?.message || 'Failed to match job description' });
  }
});

// Generate Bar Raiser final decision & model answers scorecard
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
    res.status(500).json({ error: err?.message || 'Failed to generate Bar Raiser scorecard' });
  }
});

// Chat agent
app.post('/api/chat-agent', async (req, res) => {
  try {
    const { agentId, message, history } = req.body || {};
    const reply = await chatWithCareerAgent(agentId || 'resume', message || '', history || []);
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to chat with agent' });
  }
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Career Copilot server running on port ${PORT}`);
});
