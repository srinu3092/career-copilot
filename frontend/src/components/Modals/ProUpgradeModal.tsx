import React from 'react';
import confetti from 'canvas-confetti';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    alert('Thank you! Career Copilot Pro features have been unlocked for your account.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-[#06B6D4] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span>Career Copilot Pro</span>
          </div>
          <h3 className="font-geist text-2xl font-bold">Land Your Dream 6-Figure Role</h3>
          <p className="text-xs text-white/80 mt-1">
            Unlimited AI ATS scans, live mock interviews, and compensation coaching.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              'Unlimited ATS Resume Optimization & STAR Rewrites',
              'Real-Time Video & Voice Mock Interview Simulator with Live Hints',
              '4 Multi-Agent Executive Coaches (Salary, Technical, Behavioral, ATS)',
              'FAANG & Tier-1 Tech Compensation Scripts & Counter-Offer Generator',
              '1-Click Export to Taleo/Workday-Clean Markdown & PDF Format',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </span>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between mt-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Monthly Membership
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-geist text-2xl font-black text-indigo-700">$29</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              7-Day Free Trial
            </span>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleUpgrade}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-[#06B6D4] hover:opacity-95 text-white rounded-xl font-geist text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-[16px]">stars</span>
              <span>Start 7-Day Free Pro Trial</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Cancel anytime with 1-click. No commitments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
