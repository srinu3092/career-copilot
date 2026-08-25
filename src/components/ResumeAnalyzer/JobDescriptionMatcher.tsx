import React, { useState } from 'react';
import { JobDescriptionMatchResult } from '../../types.ts';
import { saveHistoryItem } from '../../utils/historyStorage.ts';
import confetti from 'canvas-confetti';

interface JobDescriptionMatcherProps {
  resumeText: string;
  targetRole: string;
  targetCompany: string;
  onApplyTailoredBullet?: (tailoredBullet: string) => void;
}

export const JobDescriptionMatcher: React.FC<JobDescriptionMatcherProps> = ({
  resumeText,
  targetRole,
  targetCompany,
  onApplyTailoredBullet,
}) => {
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [companyInput, setCompanyInput] = useState(targetCompany || 'Target Company');
  const [roleInput, setRoleInput] = useState(targetRole || 'Senior Role');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<JobDescriptionMatchResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Sample preset JD for 1-click test
  const handleLoadSampleJD = () => {
    setCompanyInput('Amazon AWS / Stripe');
    setRoleInput('Senior Solutions Architect & Distributed Systems Lead');
    setJobDescriptionInput(
`Position: Senior Solutions Architect, Cloud & Distributed Systems
Company: AWS / Stripe Enterprise Platform

About the Role:
We are seeking an experienced Senior Solutions Architect to lead enterprise customer migrations, design high-throughput distributed microservices, and optimize multi-region cloud infrastructures.

Key Responsibilities:
- Architect multi-region cloud solutions ensuring 99.99% availability and strict latency SLOs.
- Partner with C-level executives and engineering leads to align technical architecture with strategic business outcomes.
- Spearhead FinOps cost optimization strategies, reducing cloud waste and improving infrastructure efficiency.
- Enforce Zero-Trust security principles, IAM least-privilege policies, and SOC2 / FedRAMP compliance frameworks.
- Mentor junior engineers and champion infrastructure as code (Terraform, Kubernetes, Service Mesh).

Basic Qualifications:
- 7+ years of experience in distributed cloud architecture, systems engineering, or enterprise solution design.
- Hands-on mastery of Kubernetes orchestration, Docker, Terraform, and distributed caching (Redis/Memcached).
- Proven track record of architecting solutions with measurable ROI, cost reductions, or latency improvements.
- Deep familiarity with Zero-Trust security models, OAuth2/OIDC, and compliance audits.`
    );
  };

  const handleRunJDMatch = async () => {
    if (!jobDescriptionInput.trim()) return;

    setIsMatching(true);
    try {
      const res = await fetch('/api/match-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText: jobDescriptionInput,
          targetRole: roleInput,
          targetCompany: companyInput,
        }),
      });

      if (!res.ok) throw new Error('JD match failed');
      const data: JobDescriptionMatchResult = await res.json();
      setMatchResult(data);

      // Save to history
      saveHistoryItem({
        type: 'jd_match',
        title: `${companyInput} - ${roleInput} JD Match`,
        subtitle: `${data.matchPercentage}% Match • ${data.disqualificationRisk}`,
        score: data.matchPercentage,
        data: { role: roleInput, company: companyInput, result: data },
      });

      if (data.matchPercentage >= 75) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Error running JD match:', err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleCopyBullet = (bullet: string, idx: number) => {
    navigator.clipboard.writeText(bullet);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Input Bento */}
      <div className="bento-card p-6 border-indigo-200/70 ai-gradient-bg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-indigo-600">target</span>
              <h3 className="font-geist text-lg font-bold text-[#131b2e]">
                Exact Job Description (JD) Target Matcher
              </h3>
            </div>
            <p className="text-xs text-[#464555]">
              Paste any live job post to run an enterprise ATS disqualification audit, keyword density check, and tailored bullet generator.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleJD}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start md:self-auto shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
            <span>Load Sample JD</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Company</label>
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              placeholder="e.g. Google, Amazon AWS, Stripe"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#131b2e] focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Job Title</label>
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="e.g. Senior Solutions Architect"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#131b2e] focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">
            Job Description Content (Paste Full Text or Qualifications)
          </label>
          <textarea
            value={jobDescriptionInput}
            onChange={(e) => setJobDescriptionInput(e.target.value)}
            rows={5}
            placeholder="Paste the full job description here (Responsibilities, Basic Qualifications, Tech Stack, Preferred Skills)..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[#131b2e] font-mono leading-relaxed focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center justify-between pt-3">
          <span className="text-[11px] text-slate-500">
            {jobDescriptionInput.trim() ? `${jobDescriptionInput.trim().split(/\s+/).length} words pasted` : 'Ready for analysis'}
          </span>

          <button
            type="button"
            onClick={handleRunJDMatch}
            disabled={!jobDescriptionInput.trim() || isMatching}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-[#06B6D4] hover:opacity-95 text-white rounded-xl font-geist text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 active:scale-98"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isMatching ? 'sync' : 'flaky'}
            </span>
            <span>{isMatching ? 'Matching Against Resume...' : 'Scan JD vs Resume'}</span>
          </button>
        </div>
      </div>

      {/* Match Results Section */}
      {matchResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Score Banner */}
          <div className="bento-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-indigo-200">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center shrink-0">
                <span className="font-geist text-3xl font-black text-indigo-600">
                  {matchResult.matchPercentage}%
                </span>
                <span className="text-[9px] uppercase font-bold text-indigo-800 tracking-wider">
                  JD Match
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-geist text-base font-bold text-[#131b2e]">
                    Target Alignment Scorecard
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      matchResult.disqualificationRisk === 'Low Risk'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : matchResult.disqualificationRisk === 'Moderate Risk'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {matchResult.disqualificationRisk}
                  </span>
                </div>
                <p className="text-xs text-[#464555] max-w-xl">
                  {matchResult.matchPercentage >= 80
                    ? 'Your resume aligns exceptionally well with the core responsibilities. Incorporating the suggested tailored bullets will optimize recruiter pass-through.'
                    : 'Your resume meets several key criteria, but lacks a few mandatory qualification keywords that could trigger ATS auto-disqualification filters.'}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto text-right">
              <span className="text-[11px] text-slate-400 block mb-1">Pass-Through Confidence</span>
              <span className="text-xs font-bold text-slate-700">
                {matchResult.matchPercentage >= 80 ? '🔥 Top 5% Applicant Tier' : '⚠️ Top 25% Applicant Tier'}
              </span>
            </div>
          </div>

          {/* Grid: Must-Haves & Critical Keywords Overlap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Must-Have Hard Requirements Check (Span 7) */}
            <div className="lg:col-span-7 bento-card p-6 space-y-4">
              <h4 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">fact_check</span>
                Mandatory "Must-Have" Requirements Audit
              </h4>
              <p className="text-xs text-[#464555]">
                ATS filters scan for exact presence of basic experience criteria before presenting resumes to hiring managers.
              </p>

              <div className="space-y-3 pt-2">
                {matchResult.mustHaveRequirements.map((req, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border transition-all ${
                      req.status === 'met'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : req.status === 'partial'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-[#131b2e]">{req.requirement}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                          req.status === 'met'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    {req.evidenceInResume && (
                      <p className="text-[11px] text-slate-600 mt-1.5 italic">
                        <strong>Evidence:</strong> {req.evidenceInResume}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Keywords Overlap Matrix (Span 5) */}
            <div className="lg:col-span-5 bento-card p-6 space-y-4">
              <h4 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">key</span>
                High-Frequency JD Keyword Overlap
              </h4>
              <p className="text-xs text-[#464555]">
                Terms repeated most frequently across this specific job specification.
              </p>

              <div className="space-y-2 pt-2">
                {matchResult.criticalKeywordsOverlap.map((kw, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8ff] border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          kw.foundInResume ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {kw.foundInResume ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="font-semibold text-slate-800">{kw.keyword}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {kw.frequencyInJD}x in JD
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          kw.foundInResume
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {kw.foundInResume ? 'In Resume' : 'Missing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tailored Bullet Recommendations */}
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600">edit_note</span>
                  AI-Tailored STAR Bullet Recommendations
                </h4>
                <p className="text-xs text-[#464555]">
                  Replace or enrich generic bullets with these quantified, keyword-rich statements tailored specifically for this JD.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {matchResult.tailoredBulletRecommendations.map((bulletRec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#faf8ff] border border-slate-200/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      {bulletRec.targetSection}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyBullet(bulletRec.tailoredBullet, idx)}
                      className="px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedIndex === idx ? 'done' : 'content_copy'}
                      </span>
                      <span>{copiedIndex === idx ? 'Copied!' : 'Copy Bullet'}</span>
                    </button>
                  </div>

                  {bulletRec.originalBullet && (
                    <div className="text-xs text-slate-500 bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="font-bold text-slate-700 block mb-0.5">Original Draft:</span>
                      <p className="line-through text-slate-400">{bulletRec.originalBullet}</p>
                    </div>
                  )}

                  <div className="text-xs text-[#131b2e] bg-indigo-50/60 p-3 rounded-xl border border-indigo-200">
                    <span className="font-bold text-indigo-900 block mb-1">
                      ⭐ Optimized Tailored Revision:
                    </span>
                    <p className="font-medium leading-relaxed">{bulletRec.tailoredBullet}</p>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    💡 <strong>Recruiter Impact:</strong> {bulletRec.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
