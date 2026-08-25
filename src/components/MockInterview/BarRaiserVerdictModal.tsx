import React, { useState } from 'react';
import { BarRaiserEvaluation } from '../../types.ts';
import confetti from 'canvas-confetti';

interface BarRaiserVerdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: BarRaiserEvaluation | null;
  company: string;
  role: string;
  interviewerName: string;
}

export const BarRaiserVerdictModal: React.FC<BarRaiserVerdictModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  company,
  role,
  interviewerName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !evaluation) return null;

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'Strong Hire':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200';
      case 'Hire':
        return 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-200';
      case 'Lean Hire':
        return 'bg-amber-500 text-white border-amber-400 shadow-amber-200';
      case 'No Hire':
        return 'bg-rose-600 text-white border-rose-500 shadow-rose-200';
      default:
        return 'bg-indigo-600 text-white';
    }
  };

  const handleCopyReport = () => {
    const textReport = `=========================================
BAR RAISER HIRING COMMITTEE SCORECARD
Candidate Role: ${role}
Target Company: ${company}
Bar Raiser: ${interviewerName}
Verdict: ${evaluation.verdict.toUpperCase()} (Confidence: ${evaluation.confidenceScore}%)
=========================================

EXECUTIVE SUMMARY:
${evaluation.summaryDecision}

LEADERSHIP & TECHNICAL RUBRICS:
${evaluation.leadershipAlignment.map((p) => `- ${p.principleName}: ${p.score}/100\n  Evidence: ${p.notes}`).join('\n\n')}

KEY CANDIDATE STRENGTHS:
${evaluation.keyStrengths.map((s) => `+ ${s}`).join('\n')}

CRITICAL RED FLAGS & GROWTH AREAS:
${evaluation.criticalRedFlags.map((f) => `- ${f}`).join('\n')}

BENCHMARK MODEL ANSWERS:
${evaluation.benchmarkModelAnswers.map((b) => `Q: ${b.question}\nModel Answer: ${b.exemplaryModelAnswer}\nWhy it wins: ${b.whyThisWinsHiringBar}`).join('\n\n')}
`;

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-[#faf8ff] border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <span className="material-symbols-outlined">gavel</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-geist text-lg font-bold text-[#131b2e]">
                  Official Bar Raiser Hiring Decision
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {company} Calibration
                </span>
              </div>
              <p className="text-xs text-[#464555]">
                Evaluated by {interviewerName} for {role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Verdict Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#faf8ff] to-indigo-50/40 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Final Committee Recommendation
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-1.5 rounded-xl font-geist text-sm font-black tracking-wide border shadow-md ${getVerdictStyle(
                    evaluation.verdict
                  )}`}
                >
                  {evaluation.verdict.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {evaluation.confidenceScore}% Consensus Confidence
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 max-w-md font-medium leading-relaxed">
              {evaluation.summaryDecision}
            </p>
          </div>

          {/* Company Calibrated Rubrics */}
          <div className="space-y-3">
            <h4 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">rule</span>
              {company} Calibrated Competency Rubrics
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.leadershipAlignment.map((rubric, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#faf8ff] border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#131b2e]">{rubric.principleName}</span>
                    <span
                      className={`text-xs font-mono font-black ${
                        rubric.score >= 85
                          ? 'text-emerald-600'
                          : rubric.score >= 75
                          ? 'text-indigo-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {rubric.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${rubric.score}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{rubric.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Red Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <h5 className="font-geist text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                  check_circle
                </span>
                Demonstrated Strengths
              </h5>
              <ul className="space-y-1.5">
                {evaluation.keyStrengths.map((str, i) => (
                  <li key={i} className="text-xs text-emerald-950 flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Flags / Improvements */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
              <h5 className="font-geist text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rose-600 text-[16px]">
                  warning
                </span>
                Critical Gaps &amp; Red Flags
              </h5>
              <ul className="space-y-1.5">
                {evaluation.criticalRedFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-rose-950 flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold shrink-0">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benchmark Gold-Standard Model Answers */}
          {evaluation.benchmarkModelAnswers && evaluation.benchmarkModelAnswers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                  military_tech
                </span>
                Gold-Standard Benchmark Model Answers
              </h4>

              <div className="space-y-3">
                {evaluation.benchmarkModelAnswers.map((model, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-2"
                  >
                    <span className="text-xs font-bold text-indigo-900 block">
                      Q: {model.question}
                    </span>
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-800 leading-relaxed font-medium">
                      "{model.exemplaryModelAnswer}"
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Why this wins:</strong> {model.whyThisWinsHiringBar}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#faf8ff] border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'done' : 'content_copy'}
              </span>
              <span>{copied ? 'Scorecard Copied!' : 'Copy Full Scorecard'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
