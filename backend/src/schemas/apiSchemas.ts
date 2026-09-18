import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  resumeText: z
    .string()
    .min(10, 'Resume text must contain at least 10 characters'),
  targetRole: z.string().optional().default('Senior Solutions Architect'),
  targetCompany: z.string().optional(),
});

export const mockInterviewTurnSchema = z.object({
  company: z.string().optional().default('Google'),
  role: z.string().optional().default('Senior Product Manager'),
  interviewType: z.string().optional().default('Behavioral (Leadership)'),
  history: z
    .array(
      z.object({
        role: z.string(),
        content: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  latestUserResponse: z.string().optional(),
  difficulty: z.string().optional().default('Senior'),
  interviewerName: z.string().optional().default('Alex Rivera'),
});

export const matchJDSchema = z.object({
  resumeText: z
    .string()
    .min(10, 'Resume text must contain at least 10 characters'),
  jobDescriptionText: z
    .string()
    .min(10, 'Job description text must contain at least 10 characters'),
  targetRole: z.string().optional().default('Target Role'),
  targetCompany: z.string().optional(),
});

export const barRaiserScorecardSchema = z.object({
  company: z.string().optional().default('Google'),
  role: z.string().optional().default('Senior Candidate'),
  transcript: z.array(z.any()).optional().default([]),
  interviewerName: z.string().optional().default('Bar Raiser'),
  difficulty: z.string().optional().default('Senior'),
});

export const chatAgentSchema = z.object({
  agentId: z.string().optional().default('resume'),
  message: z
    .string()
    .min(1, 'Message cannot be empty'),
  history: z.array(z.any()).optional().default([]),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;
export type MockInterviewTurnInput = z.infer<typeof mockInterviewTurnSchema>;
export type MatchJDInput = z.infer<typeof matchJDSchema>;
export type BarRaiserScorecardInput = z.infer<typeof barRaiserScorecardSchema>;
export type ChatAgentInput = z.infer<typeof chatAgentSchema>;
