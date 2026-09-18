export interface SkillItem {
  skill: string;
  impact: 'High Impact' | 'Medium Impact' | 'Low Impact';
}

export interface PresetResume {
  id: string;
  name: string;
  role: string;
  fileName: string;
  fileSize: string;
  content: string;
}

export interface ActionableImprovement {
  title: string;
  description: string;
  type: 'metric' | 'keyword' | 'formatting';
}

export interface ImpactfulVerb {
  original: string;
  improved: string;
}

export interface FormattingSuggestion {
  title: string;
  impact: 'High Impact' | 'Medium Impact' | 'Low Impact';
  status: 'pass' | 'warning' | 'info';
}

export interface ATSAnalysisResult {
  overallScore: number;
  matchLevel: 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Needs Improvement';
  summary: string;
  categoryBreakdown: {
    keywordMatch: number;
    formattingParsing: number;
    impactReadability: number;
  };
  missingSkills: SkillItem[];
  matchedSkills: string[];
  actionableImprovements: ActionableImprovement[];
  impactfulVerbs: ImpactfulVerb[];
  formattingSuggestions: FormattingSuggestion[];
  optimizedResumeMarkdown?: string;
  _meta?: {
    latencyMs?: number;
    executionMode?: 'live' | 'demo';
    cached?: boolean;
    model?: string;
    timestamp?: string;
  };
}

export interface InterviewMessage {
  id: string;
  sender: 'interviewer' | 'user';
  text: string;
  timestamp: string;
  feedback?: string;
  score?: number;
  starComponents?: {
    hasSituation: boolean;
    hasTask: boolean;
    hasAction: boolean;
    hasResult: boolean;
  };
  audioUrl?: string;
}

export interface InterviewerPersona {
  id: string;
  name: string;
  roleTitle: string;
  company: string;
  avatarUrl: string;
  badge: string;
  accentColor: string;
  voiceGender: 'female' | 'male';
  description: string;
  specialty: string;
}

export interface InterviewCompetencyScores {
  starStructure: number; // 0-100
  technicalDepth: number; // 0-100
  deliveryClarity: number; // 0-100
  leadershipImpact: number; // 0-100
  conciseness: number; // 0-100
}

export interface InterviewTurnMetric {
  turnNumber: number;
  questionPreview: string;
  score: number;
  wordCount: number;
  fillerWordsCount: number;
  wpm: number;
  starScore: number;
  timestamp: string;
}

export type InterviewMode = 'voice-video' | 'chat' | 'analytics';
export type InterviewDifficulty = 'Mid-Level' | 'Senior' | 'Staff / Principal' | 'Executive / VP';

export interface InterviewSettings {
  company: string;
  role: string;
  interviewType: string;
  difficulty: InterviewDifficulty;
  interviewerId: string;
  liveFeedbackEnabled: boolean;
}

export interface AgentProfile {
  id: 'resume' | 'salary' | 'technical' | 'behavioral';
  name: string;
  title: string;
  avatarIcon: string;
  badgeColor: string;
  description: string;
  starterQuestions: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  agentId?: 'resume' | 'salary' | 'technical' | 'behavioral';
}

export interface JobDescriptionMatchResult {
  matchPercentage: number;
  disqualificationRisk: 'Low Risk' | 'Moderate Risk' | 'High Disqualification Risk';
  mustHaveRequirements: Array<{
    requirement: string;
    status: 'met' | 'partial' | 'missing';
    evidenceInResume?: string;
  }>;
  criticalKeywordsOverlap: Array<{
    keyword: string;
    foundInResume: boolean;
    frequencyInJD: number;
  }>;
  tailoredBulletRecommendations: Array<{
    targetSection: string;
    originalBullet?: string;
    tailoredBullet: string;
    reasoning: string;
  }>;
}

export interface BarRaiserEvaluation {
  verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire';
  confidenceScore: number;
  summaryDecision: string;
  leadershipAlignment: {
    principleName: string;
    score: number; // 0-100
    notes: string;
  }[];
  keyStrengths: string[];
  criticalRedFlags: string[];
  benchmarkModelAnswers: Array<{
    question: string;
    candidateTurnSummary: string;
    exemplaryModelAnswer: string;
    whyThisWinsHiringBar: string;
  }>;
}

export interface SavedHistoryItem {
  id: string;
  type: 'resume_scan' | 'interview_session' | 'jd_match';
  title: string;
  subtitle: string;
  score: number;
  timestamp: string;
  data: any;
}

