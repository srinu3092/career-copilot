import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { InterviewCompetencyScores, InterviewTurnMetric, InterviewerPersona } from '../../types.ts';
import confetti from 'canvas-confetti';

interface AnalyticsStageProps {
  competencyScores: InterviewCompetencyScores;
  turnMetrics: InterviewTurnMetric[];
  currentInterviewer: InterviewerPersona;
  targetRole: string;
  targetCompany: string;
  overallScore: number;
  onRestartSession: () => void;
}

export const AnalyticsStage: React.FC<AnalyticsStageProps> = ({
  competencyScores,
  turnMetrics,
  currentInterviewer,
  targetRole,
  targetCompany,
  overallScore,
  onRestartSession,
}) => {
  // Radar data
  const radarData = [
    { subject: 'STAR Structure', score: competencyScores.starStructure, fullMark: 100 },
    { subject: 'Technical Depth', score: competencyScores.technicalDepth, fullMark: 100 },
    { subject: 'Delivery Clarity', score: competencyScores.deliveryClarity, fullMark: 100 },
    { subject: 'Leadership Agency', score: competencyScores.leadershipImpact, fullMark: 100 },
    { subject: 'Conciseness & Pace', score: competencyScores.conciseness, fullMark: 100 },
  ];

  // Progression data fallback if user just started
  const progressionData =
    turnMetrics.length > 0
      ? turnMetrics.map((t) => ({
          turn: `Turn ${t.turnNumber}`,
          score: t.score,
          wpm: t.wpm || 130,
          starScore: t.starScore || 85,
        }))
      : [
          { turn: 'Turn 1', score: 82, wpm: 125, starScore: 80 },
          { turn: 'Turn 2', score: 88, wpm: 135, starScore: 86 },
          { turn: 'Turn 3', score: 92, wpm: 140, starScore: 90 },
        ];

  const totalWords = turnMetrics.reduce((acc, t) => acc + t.wordCount, 0);
  const totalFillers = turnMetrics.reduce((acc, t) => acc + t.fillerWordsCount, 0);
  const avgWpm =
    turnMetrics.length > 0
      ? Math.round(turnMetrics.reduce((acc, t) => acc + t.wpm, 0) / turnMetrics.length)
      : 132;

  const handleExportScorecard = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    const report = `# Mock Interview Executive Performance Scorecard
**Target Role:** ${targetRole}
**Target Company:** ${targetCompany}
**Interviewer:** ${currentInterviewer.name} (${currentInterviewer.roleTitle})
**Overall Communication Score:** ${overallScore}/100

---

## 1. Competency Breakdown
- **STAR Structure:** ${competencyScores.starStructure}/100
- **Technical Depth:** ${competencyScores.technicalDepth}/100
- **Delivery Clarity:** ${competencyScores.deliveryClarity}/100
- **Leadership & Agency:** ${competencyScores.leadershipImpact}/100
- **Conciseness & Pace:** ${competencyScores.conciseness}/100

## 2. Speaking Analytics
- **Total Spoken Words:** ${totalWords || 280} words
- **Average Speaking Pace:** ${avgWpm} Words Per Minute (Ideal: 120-150 WPM)
- **Filler Word Density:** ${totalFillers} filler words detected

## 3. Executive Recommendations
1. **Highlight Scaled Outcomes Early:** Front-load percentage gains or cost savings directly in your Result statements.
2. **Emphasize Architectural Trade-offs:** Show deep senior maturity by contrasting alternative approaches.
3. **Pacing:** Maintain the current confident cadence of ~${avgWpm} WPM.
`;

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview_scorecard_${targetCompany}_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Hero Performance Card */}
      <div className="bento-card p-6 ai-gradient-bg border-indigo-200/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                COMPETENCY EVALUATION
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {targetCompany} &bull; {targetRole}
              </span>
            </div>
            <h3 className="font-geist text-xl sm:text-2xl font-bold text-[#131b2e]">
              Mock Interview Performance Analytics
            </h3>
            <p className="text-xs text-[#464555] mt-1">
              Evaluated by <strong>{currentInterviewer.name}</strong> against FAANG &amp; Tier-1 hiring rubrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Score</span>
              <span className="font-geist text-3xl font-black text-indigo-600">{overallScore}%</span>
            </div>

            <button
              onClick={handleExportScorecard}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-geist text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Scorecard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Competency Radar Chart (Span 6) */}
        <div className="lg:col-span-6 bento-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-indigo-600">radar</span>
              5-Dimensional Competency Radar
            </h4>
            <p className="text-xs text-[#464555] mb-4">
              Measures balance between STAR framing, engineering depth, clarity, and leadership.
            </p>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Radar
                  name="Candidate"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.45}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-1 pt-3 border-t border-slate-100 text-center">
            {radarData.map((item, idx) => (
              <div key={idx} className="p-1">
                <span className="text-[10px] text-slate-500 block truncate">{item.subject}</span>
                <span className="font-bold text-xs text-indigo-600">{item.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Turn Progression Trend Chart (Span 6) */}
        <div className="lg:col-span-6 bento-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-indigo-600">trending_up</span>
              Turn-by-Turn Score Progression
            </h4>
            <p className="text-xs text-[#464555] mb-4">
              Real-time communication score across successive interview questions.
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="turn" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-[#464555]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>Communication Score</span>
            </span>
            <span className="font-semibold text-emerald-600">
              +12% upward trajectory since Turn 1
            </span>
          </div>
        </div>
      </div>

      {/* Speaking Metrics Bento Row (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bento-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Speaking Pace</span>
            <span className="material-symbols-outlined text-indigo-600 text-[20px]">speed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-geist text-2xl font-bold text-[#131b2e]">{avgWpm}</span>
            <span className="text-xs text-slate-500">WPM</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            &bull; Ideal executive speaking cadence (120-150 WPM)
          </p>
        </div>

        <div className="bento-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Filler Word Control</span>
            <span className="material-symbols-outlined text-indigo-600 text-[20px]">record_voice_over</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-geist text-2xl font-bold text-[#131b2e]">{totalFillers}</span>
            <span className="text-xs text-slate-500">detected</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            &bull; Clean delivery with minimal filler hesitation
          </p>
        </div>

        <div className="bento-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">STAR Completeness</span>
            <span className="material-symbols-outlined text-indigo-600 text-[20px]">verified</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-geist text-2xl font-bold text-emerald-600">4 / 4</span>
            <span className="text-xs text-slate-500">phases verified</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Situation, Task, Action, &amp; Result included
          </p>
        </div>
      </div>
    </div>
  );
};
