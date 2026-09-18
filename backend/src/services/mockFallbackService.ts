import { ATSAnalysisResult } from './geminiService.js';

export function getMockResumeAnalysis(targetRole: string, targetCompany?: string): ATSAnalysisResult {
  const companyPrefix = targetCompany ? ` at ${targetCompany}` : '';
  return {
    overallScore: 84,
    matchLevel: 'Strong Match',
    summary: `Candidate exhibits compelling alignment with the ${targetRole}${companyPrefix} profile. Demonstrates strong foundational engineering leadership, architectural depth, and quantifiable business outcomes across scalable distributed systems. Strategic areas for refinement include deeper emphasis on cost-attribution metrics and multi-region resilience.`,
    categoryBreakdown: {
      keywordMatch: 86,
      formattingParsing: 92,
      impactReadability: 84,
    },
    missingSkills: [
      { skill: 'OpenTelemetry & Distributed Tracing', impact: 'High Impact' },
      { skill: 'FinOps & Cloud Cost Optimization', impact: 'Medium Impact' },
      { skill: 'Event-Driven Architecture (Apache Kafka)', impact: 'High Impact' },
      { skill: 'Zero-Trust Security & IAM Guardrails', impact: 'Medium Impact' },
    ],
    matchedSkills: [
      'Cloud Architecture (AWS/GCP)',
      'Kubernetes & Container Orchestration',
      'Microservices & REST/gRPC API Design',
      'High-Availability Systems & Fault Tolerance',
      'CI/CD Pipeline Automation',
      'Cross-Functional Technical Leadership',
      'Fullstack TypeScript & Distributed Systems',
    ],
    actionableImprovements: [
      {
        title: 'Quantify Engineering Efficiency & Latency Gains',
        description: 'Revise bullet points to include exact latency reduction (e.g., "Reduced p99 latency from 450ms to 85ms across 12M daily requests").',
        type: 'metric',
      },
      {
        title: 'Highlight Distributed Observability Tools',
        description: 'Add explicit telemetry frameworks like Prometheus, Grafana, or OpenTelemetry in the skills section to clear automated ATS filters.',
        type: 'keyword',
      },
      {
        title: 'Standardize Impact Verb Formatting',
        description: 'Ensure each experience section starts with high-conviction action verbs followed immediately by the business outcome.',
        type: 'formatting',
      },
    ],
    impactfulVerbs: [
      {
        original: 'Helped with deployment and cluster setup',
        improved: 'Spearheaded zero-downtime blue/green deployment strategy across Kubernetes clusters',
      },
      {
        original: 'Worked on microservices architecture',
        improved: 'Architected event-driven microservices processing 50k RPS with sub-100ms p99 latency',
      },
      {
        original: 'Managed database replication migrations',
        improved: 'Orchestrated multi-region active-active database replication and failover protocol',
      },
    ],
    formattingSuggestions: [
      {
        title: 'Font Hierarchy and Consistency',
        impact: 'High Impact',
        status: 'pass',
      },
      {
        title: 'Section Header ATS Parsing Standards',
        impact: 'Medium Impact',
        status: 'pass',
      },
      {
        title: 'Contact Information & LinkedIn Hyperlinks',
        impact: 'Low Impact',
        status: 'info',
      },
    ],
  };
}

export function getMockInterviewTurn(
  role: string,
  company: string,
  history: any[],
  latestResponse?: string
) {
  const turnIndex = history ? history.length : 0;

  if (turnIndex === 0 || !latestResponse) {
    return {
      interviewerReply: `Welcome! Let's dive straight in. We're looking for an exceptional ${role} here at ${company}. Can you share an architectural challenge where you had to balance strict latency SLAs against engineering complexity and tight deadlines?`,
      feedback: {
        score: 80,
        positiveNotes: ['Strong, enthusiastic opening stance'],
        areasForImprovement: ['Prepare to structure your response using the STAR framework'],
      },
      starAnalysis: {
        situationScore: 80,
        taskScore: 80,
        actionScore: 75,
        resultScore: 70,
        detailedBreakdown: 'Clear context and task framing. Make sure your measurable results are front and center.',
      },
      suggestedFollowUp: 'What tradeoffs did you evaluate before deciding on this architecture?',
    };
  }

  return {
    interviewerReply: `That's a very solid breakdown of the constraints. In that scenario, how did you ensure observability and error handling across your microservices when a downstream dependency experienced cascading timeouts?`,
    feedback: {
      score: 88,
      positiveNotes: [
        'Great clarity on technical ownership and leadership under pressure',
        'Strong justification for technology selection',
      ],
      areasForImprovement: [
        'Could include quantitative recovery times (MTTR) or SLA metrics to seal the impact',
      ],
    },
    starAnalysis: {
      situationScore: 90,
      taskScore: 85,
      actionScore: 88,
      resultScore: 85,
      detailedBreakdown: 'Excellent technical depth and STAR structure. The action steps clearly demonstrated senior-level systems thinking.',
    },
    suggestedFollowUp: 'What post-mortem lessons were applied to prevent recurrence?',
  };
}

export function getMockScorecard(company: string, role: string) {
  return {
    overallScore: 88,
    decision: 'STRONG HIRE' as const,
    summary: `Candidate demonstrated exceptional competency for the ${role} position at ${company}. Displayed mastery of distributed system trade-offs, structured communication (STAR framework), and high ownership during ambiguous scenarios. Exceeds the bar across technical judgment and collaborative leadership.`,
    competencyScores: [
      { name: 'System Design & Scalability', score: 92, weight: 'High' },
      { name: 'Communication & STAR Structuring', score: 88, weight: 'High' },
      { name: 'Ownership & Decision Making', score: 90, weight: 'Medium' },
      { name: 'Problem Solving & Resilience', score: 85, weight: 'High' },
    ],
    strengths: [
      'Articulated concrete trade-offs with data-backed reasoning',
      'Maintained composure and high clarity when probed with follow-up edge cases',
      'Quantified business and operational impact across all delivered milestones',
    ],
    developmentAreas: [
      'Could incorporate more proactive multi-tenant cost optimization strategies',
      'Opportunity to elaborate further on post-incident retro culture and continuous team coaching',
    ],
    modelAnswers: [
      {
        question: 'How do you handle cascading failures in distributed systems?',
        idealStructure: 'Situation -> Exponential Backoff & Circuit Breakers -> Graceful Degradation -> Measurable SLA retention',
        exampleBestResponse: 'I implemented client-side circuit breakers via resilience4j and shed non-critical traffic under high load, maintaining 99.99% availability on tier-0 checkout flows.',
      },
    ],
  };
}
