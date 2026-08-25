import React, { useState, useEffect } from 'react';

interface SettingsViewProps {
  onOpenUpgradeModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenUpgradeModal }) => {
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('Alex Morgan');
  const [targetRole, setTargetRole] = useState('Senior Solutions Architect');
  const [targetLocation, setTargetLocation] = useState('San Francisco, CA / Remote');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setHasGeminiKey(Boolean(data.hasGeminiKey)))
      .catch(() => setHasGeminiKey(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-geist text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
          Application &amp; Profile Settings
        </h2>
        <p className="text-sm text-[#464555]">
          Manage your career target parameters, AI model preferences, and session data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Settings Bento (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bento-card p-6 space-y-4">
            <h3 className="font-geist text-base font-bold text-[#131b2e] flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">person</span>
              Career Profile &amp; Target Role
            </h3>

            <div>
              <label className="font-geist text-xs font-medium text-[#464555] mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#f2f3ff] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-geist text-xs font-medium text-[#464555] mb-1 block">
                Primary Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-[#f2f3ff] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-geist text-xs font-medium text-[#464555] mb-1 block">
                Target Location / Work Mode
              </label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full bg-[#f2f3ff] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-geist text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Preferences</span>
              </button>

              {savedFeedback && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Saved successfully!
                </span>
              )}
            </div>
          </form>

          {/* AI Configuration Info Bento */}
          <div className="bento-card p-6">
            <h3 className="font-geist text-base font-bold text-[#131b2e] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">neurology</span>
              AI Engine &amp; Gemini Integration
            </h3>
            <p className="text-xs text-[#464555] mb-4">
              Career Copilot uses the Google Gemini 3.7 Flash model server-side to conduct deep ATS parsing, real-time mock interviews, and multi-agent career coaching.
            </p>

            <div className="p-3.5 bg-[#faf8ff] rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    hasGeminiKey ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'
                  }`}
                />
                <span className="font-semibold text-slate-800">
                  {hasGeminiKey ? 'Gemini API Connected (Active)' : 'AI Server Ready'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Model: gemini-3.7-flash</span>
            </div>
          </div>
        </div>

        {/* Right Subscription & Data Bento (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bento-card p-6 ai-gradient-bg border-indigo-200/70">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                CURRENT TIER
              </span>
              <span className="text-xs text-indigo-700 font-bold">Pro Trial</span>
            </div>

            <h3 className="font-geist text-lg font-bold text-[#131b2e] mb-1">
              Career Copilot Executive Pro
            </h3>
            <p className="text-xs text-[#464555] mb-4">
              Unlimited ATS resume scans, custom role benchmarking, multi-agent compensation coaching, and live voice mock interviews.
            </p>

            <button
              onClick={onOpenUpgradeModal}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-[#06B6D4] text-white rounded-xl font-geist text-xs font-bold shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">stars</span>
              <span>Manage Pro Subscription</span>
            </button>
          </div>

          <div className="bento-card p-6">
            <h3 className="font-geist text-base font-bold text-[#131b2e] mb-2">
              Privacy &amp; Data Control
            </h3>
            <p className="text-xs text-[#464555] mb-4 leading-relaxed">
              Your resume text and interview transcripts are processed securely and never used to train public models.
            </p>

            <button
              onClick={() => {
                if (window.confirm('Clear all local saved interview transcripts and cached resume scans?')) {
                  localStorage.clear();
                  alert('Local cached data cleared.');
                }
              }}
              className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold border border-red-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span>Clear Local Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
