import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

describe('Career Copilot API Suite', () => {
  describe('GET /api/status', () => {
    it('should return 200 with online status and security headers', async () => {
      const res = await request(app).get('/api/status');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('online');
      expect(res.body.service).toBe('career-copilot-backend');
      expect(res.headers['x-content-type-options']).toBe('nosniff'); // Helmet header
    });
  });

  describe('POST /api/analyze-resume Validation', () => {
    it('should reject empty payload with 400 and validation errors', async () => {
      const res = await request(app).post('/api/analyze-resume').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details).toBeInstanceOf(Array);
      expect(res.body.details.some((d: any) => d.field === 'resumeText')).toBe(true);
    });

    it('should reject resume text shorter than 10 characters', async () => {
      const res = await request(app).post('/api/analyze-resume').send({
        resumeText: 'Too short',
        targetRole: 'Architect',
      });
      expect(res.status).toBe(400);
      expect(res.body.details[0].message).toContain('at least 10 characters');
    });
  });

  describe('POST /api/analyze-resume Execution & Caching', () => {
    const validPayload = {
      resumeText: 'Senior Software Engineer with 8 years of experience building distributed systems in TypeScript and Go.',
      targetRole: 'Staff Software Engineer',
      targetCompany: 'Google',
    };

    it('should analyze resume and return rich scorecard with telemetry in demo mode', async () => {
      const res = await request(app)
        .post('/api/analyze-resume')
        .set('x-demo-mode', 'true')
        .send(validPayload);

      expect(res.status).toBe(200);
      expect(res.body.overallScore).toBeGreaterThanOrEqual(80);
      expect(res.body.matchedSkills).toBeInstanceOf(Array);
      expect(res.body._meta).toBeDefined();
      expect(res.body._meta.executionMode).toBe('demo');
      expect(typeof res.body._meta.latencyMs).toBe('number');
    });

    it('should serve subsequent identical request from LRU cache with cached: true', async () => {
      // First request primes the cache
      await request(app)
        .post('/api/analyze-resume')
        .set('x-demo-mode', 'true')
        .send(validPayload);

      // Second request should hit LRU cache
      const cachedRes = await request(app)
        .post('/api/analyze-resume')
        .set('x-demo-mode', 'true')
        .send(validPayload);

      expect(cachedRes.status).toBe(200);
      expect(cachedRes.body._meta.cached).toBe(true);
      expect(cachedRes.body._meta.latencyMs).toBeLessThan(50); // Cache response is instantaneous
    });
  });

  describe('POST /api/mock-interview-turn', () => {
    it('should conduct an interview turn with persona and star analysis', async () => {
      const res = await request(app)
        .post('/api/mock-interview-turn')
        .set('x-demo-mode', 'true')
        .send({
          role: 'Senior Solutions Architect',
          company: 'Amazon',
          history: [],
          latestUserResponse: 'I architected a zero-trust multi-cloud networking system.',
        });

      expect(res.status).toBe(200);
      expect(res.body.interviewerReply).toBeDefined();
      expect(res.body.feedback).toBeDefined();
      expect(res.body._meta).toBeDefined();
    });
  });
});
