import React, { useState, useEffect } from 'react';
import { getSavedHistory, deleteHistoryItem, clearSavedHistory } from '../../utils/historyStorage.ts';
import { SavedHistoryItem } from '../../types.ts';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenUpgradeModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenUpgradeModal,
}) => {
  const [historyItems, setHistoryItems] = useState<SavedHistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(getSavedHistory());
  }, []);

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    setHistoryItems(getSavedHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all session history?')) {
      clearSavedHistory();
      setHistoryItems([]);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-geist text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
              Welcome back, Alex
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Active Job Search
            </span>
          </div>
          <p className="text-sm text-[#464555]">
            Targeting: <strong className="text-indigo-600">Senior Solutions Architect</strong> &amp;{' '}
            <strong className="text-indigo-600">Staff Cloud Engineer</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('resume-analyzer')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-geist text-xs font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-98"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Scan Resume</span>
          </button>
          <button
            onClick={() => onNavigate('mock-interview')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-geist text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span>Start Mock Session</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bento Hero 1: Overall Career Readiness (Span 8) */}
        <div className="md:col-span-8 bento-card p-6 ai-gradient-bg border-indigo-200/60 relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Executive Readiness Index
              </span>
              <h3 className="font-geist text-2xl font-bold text-[#131b2e] mt-0.5">
                84% Overall Candidate Match
              </h3>
              <p className="text-xs text-[#464555] max-w-md mt-1">
                Your profile is in the top 10% of candidates applying for Senior Solutions
                Architect roles across Tier-1 tech firms.
              </p>
            </div>

            <div className="px-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-100 text-center shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 block">ATS SCAN SCORE</span>
              <span className="font-geist text-3xl font-black text-indigo-600">84</span>
              <span className="text-[10px] text-emerald-600 font-semibold block">Strong Match</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-indigo-100">
            <div className="p-3 bg-white/80 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">ATS Formatting</span>
              <span className="font-geist text-base font-bold text-emerald-600">96%</span>
              <span className="text-[9px] text-slate-400 block">Parses clean</span>
            </div>
            <div className="p-3 bg-white/80 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">Technical Depth</span>
              <span className="font-geist text-base font-bold text-indigo-600">78%</span>
              <span className="text-[9px] text-slate-400 block">Kubernetes gap</span>
            </div>
            <div className="p-3 bg-white/80 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">Mock Communication</span>
              <span className="font-geist text-base font-bold text-cyan-600">85%</span>
              <span className="text-[9px] text-slate-400 block">STAR structured</span>
            </div>
          </div>
        </div>

        {/* Bento Card 2: Target Pipeline (Span 4) */}
        <div className="md:col-span-4 bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                  business_center
                </span>
                Active Application Pipeline
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">3 Target Roles</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-geist text-xs font-bold text-slate-900">Google</p>
                  <p className="text-[10px] text-slate-500">Sr. Solutions Architect • Bay Area</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                  Ready
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-geist text-xs font-bold text-slate-900">Amazon AWS</p>
                  <p className="text-[10px] text-slate-500">Principal Cloud Architect • Seattle</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
                  Needs K8s
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-geist text-xs font-bold text-slate-900">Stripe</p>
                  <p className="text-[10px] text-slate-500">Infrastructure Engineer L5 • Remote</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                  Mock Ready
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('knowledge-base')}
            className="w-full mt-3 text-xs text-indigo-600 font-medium hover:text-indigo-800 text-center"
          >
            View company interview frameworks &rarr;
          </button>
        </div>

        {/* Bento Card 3: Quick Action - ATS Optimizer (Span 4) */}
        <div
          onClick={() => onNavigate('resume-analyzer')}
          className="md:col-span-4 bento-card p-6 cursor-pointer hover:border-indigo-400 group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">analytics</span>
          </div>
          <h4 className="font-geist text-sm font-bold text-[#131b2e] mb-1 flex items-center justify-between">
            <span>ATS Resume Scanner</span>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </h4>
          <p className="text-xs text-[#464555]">
            Run deep keyword matching, calculate parse scores, and get instant STAR rewrites.
          </p>
        </div>

        {/* Bento Card 4: Quick Action - Live Mock Interview (Span 4) */}
        <div
          onClick={() => onNavigate('mock-interview')}
          className="md:col-span-4 bento-card p-6 cursor-pointer hover:border-cyan-400 group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">record_voice_over</span>
          </div>
          <h4 className="font-geist text-sm font-bold text-[#131b2e] mb-1 flex items-center justify-between">
            <span>Live Mock Simulator</span>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </h4>
          <p className="text-xs text-[#464555]">
            Realistic AI video &amp; voice interviewer providing real-time STAR feedback and hints.
          </p>
        </div>

        {/* Bento Card 5: Quick Action - Multi-Agent Advisory (Span 4) */}
        <div
          onClick={() => onNavigate('multi-agent-chat')}
          className="md:col-span-4 bento-card p-6 cursor-pointer hover:border-emerald-400 group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </div>
          <h4 className="font-geist text-sm font-bold text-[#131b2e] mb-1 flex items-center justify-between">
            <span>Multi-Agent Career Team</span>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </h4>
          <p className="text-xs text-[#464555]">
            Chat directly with compensation specialists, system architects, and executive recruiters.
          </p>
        </div>
      </div>

      {/* Persistent Session History Bento */}
      <div className="mt-8 bento-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">history_edu</span>
            <h3 className="font-geist text-base font-bold text-[#131b2e]">
              Saved Session History &amp; Scorecards
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {historyItems.length} Records
            </span>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-slate-500 hover:text-rose-600 transition-colors font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
              <span>Clear History</span>
            </button>
          )}
        </div>

        {historyItems.length === 0 ? (
          <div className="p-8 text-center bg-[#faf8ff] rounded-2xl border border-dashed border-slate-200">
            <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">history</span>
            <p className="font-geist text-xs font-semibold text-slate-700">No sessions recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Run an ATS Resume Scan, JD Match, or complete an AI Mock Interview to automatically save
              calibrated scorecards here.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => onNavigate('resume-analyzer')}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                Scan Resume
              </button>
              <button
                onClick={() => onNavigate('mock-interview')}
                className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
              >
                Start Mock Interview
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {historyItems.map((item) => {
              let icon = 'article';
              let badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';

              if (item.type === 'interview_session') {
                icon = 'videocam';
                badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
              } else if (item.type === 'jd_match') {
                icon = 'target';
                badgeColor = 'bg-cyan-50 text-cyan-700 border-cyan-200';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'interview_session') {
                      onNavigate('mock-interview');
                    } else {
                      onNavigate('resume-analyzer');
                    }
                  }}
                  className="p-4 rounded-xl bg-[#faf8ff] border border-[#c7c4d8]/40 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                      </div>
                      <div>
                        <h5 className="font-geist text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(item.timestamp).toLocaleDateString()} at{' '}
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                      title="Delete record"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 line-clamp-1">{item.subtitle}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
                      {item.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {item.score !== undefined && (
                      <span className="font-geist font-black text-xs text-indigo-600">
                        {item.score}% Score
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
