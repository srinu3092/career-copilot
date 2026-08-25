import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import express from 'express';
import {
  analyzeResumeWithGemini,
  conductMockInterviewTurn,
  chatWithCareerAgent,
  matchJobDescriptionWithGemini,
  generateBarRaiserScorecardWithGemini,
} from './server/geminiService.ts';

dotenv.config();

function apiServerPlugin(): Plugin {
  return {
    name: 'career-copilot-api',
    configureServer(server) {
      server.middlewares.use(express.json({ limit: '10mb' }));

      // API: Health check & API key presence
      server.middlewares.use('/api/status', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'online',
            hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
            timestamp: new Date().toISOString(),
          })
        );
      });

      // API: Analyze Resume
      server.middlewares.use('/api/analyze-resume', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const { resumeText, targetRole, targetCompany } = (req as any).body || {};
          const result = await analyzeResumeWithGemini(
            resumeText || '',
            targetRole || 'Senior Solutions Architect',
            targetCompany
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Failed to analyze resume' }));
        }
      });

      // API: Mock Interview Turn
      server.middlewares.use('/api/mock-interview-turn', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const { company, role, interviewType, history, latestUserResponse, difficulty, interviewerName } = (req as any).body || {};
          const result = await conductMockInterviewTurn(
            company || 'Google',
            role || 'Senior Product Manager',
            interviewType || 'Behavioral (Leadership)',
            history || [],
            latestUserResponse,
            difficulty || 'Senior',
            interviewerName || 'Alex Rivera'
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Failed to run mock interview turn' }));
        }
      });

      // API: Multi-Agent Chat
      server.middlewares.use('/api/chat-agent', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const { agentId, message, history } = (req as any).body || {};
          const reply = await chatWithCareerAgent(agentId || 'resume', message || '', history || []);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ reply }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Failed to chat with agent' }));
        }
      });

      // API: Match Job Description
      server.middlewares.use('/api/match-jd', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const { resumeText, jobDescriptionText, targetRole, targetCompany } = (req as any).body || {};
          const result = await matchJobDescriptionWithGemini(
            resumeText || '',
            jobDescriptionText || '',
            targetRole || 'Senior Role',
            targetCompany
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Failed to match job description' }));
        }
      });

      // API: Bar Raiser Scorecard
      server.middlewares.use('/api/bar-raiser-scorecard', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const { company, role, transcript, interviewerName, difficulty } = (req as any).body || {};
          const result = await generateBarRaiserScorecardWithGemini(
            company || 'Google',
            role || 'Senior Candidate',
            transcript || [],
            interviewerName || 'Bar Raiser',
            difficulty || 'Senior'
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Failed to generate Bar Raiser scorecard' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
