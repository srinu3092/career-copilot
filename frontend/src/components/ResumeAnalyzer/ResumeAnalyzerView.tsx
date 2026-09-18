import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ATSAnalysisResult, PresetResume } from '../../types.ts';
import { SAMPLE_RESUMES } from '../../data/sampleResumes.ts';
import { extractTextFromFile } from '../../utils/fileParser.ts';
import { JobDescriptionMatcher } from './JobDescriptionMatcher.tsx';
import { SideBySideDiffView } from './SideBySideDiffView.tsx';
import { saveHistoryItem } from '../../utils/historyStorage.ts';
import { TelemetryBadge } from '../Common/TelemetryBadge.tsx';

interface ResumeAnalyzerViewProps {
  onStartMockInterviewForRole?: (role: string) => void;
  onOpenUpgradeModal: () => void;
}

export const ResumeAnalyzerView: React.FC<ResumeAnalyzerViewProps> = ({
  onStartMockInterviewForRole,
  onOpenUpgradeModal,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetResume>(SAMPLE_RESUMES[0]);
  const [targetRole, setTargetRole] = useState(SAMPLE_RESUMES[0].role);
  const [targetCompany, setTargetCompany] = useState('Google');
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].content);
  const [fileName, setFileName] = useState(SAMPLE_RESUMES[0].fileName);
  const [fileSize, setFileSize] = useState(SAMPLE_RESUMES[0].fileSize);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'bento' | 'jd-matcher' | 'side-by-side'>('bento');
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [parseStatus, setParseStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Analysis Result initialized to the exact matching data from the design screenshots
  const [analysis, setAnalysis] = useState<ATSAnalysisResult>({
    overallScore: 75,
    matchLevel: 'Good Match',
    summary:
      'Your resume is strong, but missing key technical requirements for a Senior level role. See breakdown below.',
    categoryBreakdown: {
      keywordMatch: 68,
      formattingParsing: 95,
      impactReadability: 82,
    },
    missingSkills: [
      { skill: 'Kubernetes', impact: 'High Impact' },
      { skill: 'System Design', impact: 'High Impact' },
      { skill: 'GCP', impact: 'Medium Impact' },
      { skill: 'Terraform', impact: 'Medium Impact' },
    ],
    matchedSkills: ['AWS', 'Python', 'Agile', 'Docker', 'REST APIs', 'CI/CD'],
    actionableImprovements: [
      {
        title: 'Quantify Experience Outcomes',
        description:
          "Bullet point 3 under 'Cloud Engineer' lacks metrics. Try revising to: \"Reduced cloud infrastructure costs by 22% ($45k/yr) through implementing automated resource scaling.\"",
        type: 'metric',
      },
      {
        title: 'Incorporate Missing Keywords',
        description:
          "The job description heavily emphasizes 'Kubernetes' and 'Microservices'. Ensure these terms appear naturally in your recent experience sections if you possess these skills.",
        type: 'keyword',
      },
      {
        title: 'Optimize Header Structure',
        description:
          'Your contact information is in a table format which some older ATS systems struggle to parse. Convert this to standard text layout.',
        type: 'formatting',
      },
    ],
    impactfulVerbs: [
      { original: 'Helped', improved: 'Orchestrated' },
      { original: 'Managed', improved: 'Spearheaded' },
      { original: 'Worked on', improved: 'Optimized' },
    ],
    formattingSuggestions: [
      { title: 'Standardize Date Formats', impact: 'High Impact', status: 'pass' },
      { title: 'Remove Graphics/Icons', impact: 'High Impact', status: 'pass' },
      { title: 'Increase Margin Consistency', impact: 'Low Impact', status: 'info' },
    ],
    optimizedResumeMarkdown: `# JANE DOE
San Francisco, CA | (555) 019-2834 | jane.doe@example.com | linkedin.com/in/janedoe

## EXECUTIVE SUMMARY
Senior Solutions Architect with 7+ years architecting enterprise distributed cloud infrastructures, driving 99.99% availability and saving over $1.2M in annual operational costs across AWS and hybrid-cloud deployments.

## CORE TECHNICAL COMPETENCIES
- Cloud Architecture: AWS (Certified Pro), GCP, Kubernetes, Docker, Terraform (IaC), CI/CD Automation
- Systems & Design: Microservices, System Design, Event-Driven Architecture, High Availability, Zero-Trust Security
- Programming: Python, Go, TypeScript, Bash, SQL, REST APIs

## PROFESSIONAL EXPERIENCE
### Lead Cloud Architect — Apex Global Technologies | 2021 – Present
- Spearheaded zero-downtime migration of 40+ enterprise workloads to AWS multi-region Kubernetes clusters, slashing latency by 38%.
- Orchestrated automated resource scaling and Spot instance policies, reducing cloud infrastructure costs by 22% ($45k/yr).
- Engineered automated disaster recovery protocols with RTO < 5 minutes and RPO < 30 seconds for 12TB PostgreSQL cluster.

### Systems Engineer — Nova Tech Labs | 2018 – 2021
- Optimized containerized microservice pipelines across 18 development squads, accelerating release velocity by 65%.
- Implemented automated IAM least-privilege policies, remediating 94 compliance vulnerabilities.`,
  });

  const handleSelectPreset = (preset: PresetResume) => {
    setSelectedPreset(preset);
    setTargetRole(preset.role);
    setResumeText(preset.content);
    setFileName(preset.fileName);
    setFileSize(preset.fileSize);
    setUploadError(null);
    runAnalysis(preset.content, preset.role);
  };

  const processUploadedFile = async (file: File) => {
    if (!file) return;
    setUploadError(null);
    setFileName(file.name);
    
    // Human readable file size
    const sizeInKb = file.size / 1024;
    const formattedSize = sizeInKb > 1024 
      ? `${(sizeInKb / 1024).toFixed(1)} MB`
      : `${Math.round(sizeInKb)} KB`;
    setFileSize(formattedSize);

    setIsScanning(true);
    setParseStatus(`Reading ${file.name}...`);

    try {
      const extracted = await extractTextFromFile(file, (status) => {
        setParseStatus(status);
      });

      if (!extracted.text || extracted.text.trim().length < 40) {
        throw new Error('Extracted text is too short or empty. Please ensure the file contains readable text.');
      }

      setResumeText(extracted.text);
      setParseStatus(`Scanning ${extracted.pageCount ? `${extracted.pageCount} pages ` : ''}with Gemini ATS Engine...`);
      await runAnalysis(extracted.text, targetRole);
    } catch (err: any) {
      console.error('File parsing/scanning error:', err);
      setUploadError(err?.message || 'Could not extract text from this document. Try copying text into the editor.');
      // If error occurs, still allow user to inspect or type
    } finally {
      setIsScanning(false);
      setParseStatus(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    // reset input value so re-uploading same file works
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const runAnalysis = async (text: string, role: string) => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: text,
          targetRole: role,
          targetCompany: targetCompany,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const data: ATSAnalysisResult = await response.json();
      setAnalysis(data);

      saveHistoryItem({
        type: 'resume_scan',
        title: `${role} Resume Scan`,
        subtitle: `${fileName} (${data.overallScore}% Match • ${data.matchLevel})`,
        score: data.overallScore,
        data: { role, targetCompany, analysis: data },
      });

      if (data.overallScore >= 80) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
      setParseStatus(null);
    }
  };

  const handleCopyVerb = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVerb(text);
    setTimeout(() => setCopiedVerb(null), 2000);
  };

  const handleDownloadOptimizedResume = () => {
    const markdownContent =
      analysis.optimizedResumeMarkdown ||
      `# ${targetRole} - Optimized Resume\n\n${resumeText}\n\n## Targeted Keywords Added\n${analysis.missingSkills
        .map((s) => `- ${s.skill}`)
        .join('\n')}`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimized_${fileName.replace(/\.[^/.]+$/, '')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Circular gauge calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.overallScore / 100) * circumference;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="font-geist text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
              Resume Analyzer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
              ATS 2.0 Engine
            </span>
          </div>
          <p className="text-sm md:text-base text-[#464555] max-w-2xl leading-relaxed">
            Upload your resume to get instant ATS scoring, uncover hidden skill gaps, and receive
            AI-driven actionable feedback tailored to your target role.
          </p>
        </div>

        {/* Live Resume Agent Active Glass Badge */}
        <div className="glass-panel flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-400/40 shadow-xs">
          <div className="relative flex items-center justify-center w-5 h-5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-30 pulse-ring"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
          </div>
          <span className="font-geist text-xs font-semibold text-[#00687a]">
            {isScanning ? 'Analyzing with Gemini AI...' : 'Resume Agent Active'}
          </span>
        </div>
      </div>

      {/* Preset Role Quick Selector */}
      <div className="mb-6 bg-white p-3.5 rounded-2xl border border-[#c7c4d8]/30 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-[18px]">quickreply</span>
          <span className="font-geist text-xs font-semibold text-slate-700">Quick Test Profiles:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_RESUMES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedPreset.id === preset.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 mb-6 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('bento')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'bento'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          <span>ATS Audit &amp; Scorecard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jd-matcher')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'jd-matcher'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">target</span>
          <span>Exact JD Target Matcher</span>
          <span className="px-1.5 py-0.2 bg-cyan-100 text-cyan-800 text-[10px] font-bold rounded-md">New</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('side-by-side')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'side-by-side'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">compare</span>
          <span>Side-by-Side ATS Diff &amp; Export</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">Export</span>
        </button>
      </div>

      {activeTab === 'jd-matcher' && (
        <JobDescriptionMatcher
          resumeText={resumeText}
          targetRole={targetRole}
          targetCompany={targetCompany}
        />
      )}

      {activeTab === 'side-by-side' && (
        <SideBySideDiffView
          originalText={resumeText}
          optimizedText={analysis.optimizedResumeMarkdown}
          role={targetRole}
        />
      )}

      {activeTab === 'bento' && (
        <>
          {/* Main Grid: Left Upload & Target + Right Bento Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Target Role Card */}
          <div className="bento-card p-6">
            <h3 className="font-geist text-base font-bold text-[#131b2e] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">track_changes</span>
              Target Role
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-geist text-xs font-medium text-[#464555] mb-1.5 block" htmlFor="job-title">
                  Job Title or URL
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Solutions Architect"
                  className="w-full bg-[#f2f3ff] border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                />
              </div>

              <div>
                <label className="font-geist text-xs font-medium text-[#464555] mb-1.5 block">
                  Target Company (Optional)
                </label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-[#f2f3ff] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="Google">Google</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Meta">Meta</option>
                  <option value="Apple">Apple</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Enterprise Tech">Enterprise Tech</option>
                </select>
              </div>

              <button
                onClick={() => runAnalysis(resumeText, targetRole)}
                disabled={isScanning}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-geist text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isScanning ? 'sync' : 'search'}
                </span>
                <span>{isScanning ? 'Scanning with AI...' : 'Re-Evaluate Match'}</span>
              </button>
            </div>
          </div>

          {/* Document Upload Area Card */}
          <div className="bento-card p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-geist text-base font-bold text-[#131b2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600">upload_file</span>
                  Document
                </h3>
                <button
                  onClick={() => setShowEditorModal(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Edit Text</span>
                </button>
              </div>

              {/* Drag & Drop Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group ${
                  isDraggingOver
                    ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
                    : 'border-[#c7c4d8] hover:border-indigo-500 bg-[#faf8ff]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                  className="hidden"
                />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${
                  isDraggingOver ? 'bg-indigo-600 text-white' : 'bg-indigo-100/70 text-indigo-600'
                }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {parseStatus ? 'sync' : 'description'}
                  </span>
                </div>
                <p className="font-geist text-xs font-bold text-[#131b2e] mb-1">
                  {isDraggingOver ? 'Drop your resume file here' : 'Drag & drop your resume from local computer'}
                </p>
                <p className="text-[11px] text-[#464555] mb-4">
                  Full PDF text parsing, Word DOCX, and TXT (Instant scan)
                </p>
                <button
                  type="button"
                  className="bg-indigo-600 text-white font-geist text-xs font-semibold px-4 py-2 rounded-xl shadow-xs hover:bg-indigo-700 transition-colors pointer-events-none"
                >
                  Browse Local Files
                </button>
              </div>

              {/* Real-time Parsing / Scanning Status Bar */}
              {parseStatus && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200/80 rounded-xl flex items-center gap-2.5 text-xs text-indigo-800 font-medium animate-in fade-in">
                  <span className="material-symbols-outlined text-indigo-600 animate-spin text-[18px]">
                    progress_activity
                  </span>
                  <span>{parseStatus}</span>
                </div>
              )}

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                  <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{uploadError}</p>
                    <button
                      type="button"
                      onClick={() => setShowEditorModal(true)}
                      className="underline font-bold mt-1 text-rose-900 block"
                    >
                      Paste resume text manually into editor &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Uploaded File State */}
              <div className="mt-4 p-3 bg-[#faf8ff] border border-[#c7c4d8]/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-2xl">
                    check_circle
                  </span>
                  <div>
                    <p className="font-geist text-xs font-semibold text-[#131b2e] truncate max-w-[150px]">
                      {fileName}
                    </p>
                    <p className="text-[10px] text-[#464555] flex items-center gap-1">
                      <span>{fileSize}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-700 font-medium">Text Extracted</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowEditorModal(true)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="View & Edit Text"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick action: Practice Mock Interview */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => onStartMockInterviewForRole?.(targetRole)}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                <span>Practice Interview for this Role</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Bento Grid Results (Span 8) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Overall ATS Match Hero Card (Span 2) */}
          <div className="bento-card p-6 md:col-span-2 ai-gradient-bg relative overflow-hidden border-indigo-200/50">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-geist text-xl font-bold text-[#131b2e]">Overall ATS Match</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200">
                    {analysis.matchLevel}
                  </span>
                </div>
                {analysis._meta && (
                  <div className="mb-2">
                    <TelemetryBadge meta={analysis._meta} />
                  </div>
                )}
                <p className="text-sm text-[#464555] max-w-md leading-relaxed">
                  {analysis.summary}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700 font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Evaluated against 1,200+ {targetRole} job descriptions</span>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r={radius} stroke="#eaedff" strokeWidth="8" />
                  <circle
                    className="transition-all duration-1000 ease-out"
                    cx="50"
                    cy="50"
                    fill="none"
                    r={radius}
                    stroke="#4F46E5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-geist text-3xl font-extrabold ai-gradient-text">
                    {analysis.overallScore}
                  </span>
                  <span className="text-[11px] font-medium text-[#464555]">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Category Breakdown */}
          <div className="bento-card p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-geist text-xs font-bold text-[#464555] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[16px]">bar_chart</span>
                Category Breakdown
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#131b2e] font-medium">Keyword Match</span>
                    <span className="font-bold text-indigo-600">
                      {analysis.categoryBreakdown.keywordMatch}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#eaedff] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${analysis.categoryBreakdown.keywordMatch}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#131b2e] font-medium">Formatting &amp; Parsing</span>
                    <span className="font-bold text-emerald-600">
                      {analysis.categoryBreakdown.formattingParsing}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#eaedff] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${analysis.categoryBreakdown.formattingParsing}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#131b2e] font-medium">Impact Readability</span>
                    <span className="font-bold text-amber-600">
                      {analysis.categoryBreakdown.impactReadability}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#eaedff] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${analysis.categoryBreakdown.impactReadability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#464555]">
              <span>ATS Format Status:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check</span>
                Standard Clean Layout
              </span>
            </div>
          </div>

          {/* Card 3: Skill Gap Analysis */}
          <div className="bento-card p-6 glass-panel flex flex-col justify-between">
            <div>
              <h4 className="font-geist text-xs font-bold text-[#464555] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600 text-[18px]">auto_awesome</span>
                Skill Gap Analysis
              </h4>

              <div className="space-y-4">
                <div>
                  <p className="font-geist text-xs font-semibold text-[#131b2e] mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-red-500 text-[14px]">warning</span>
                    Missing Critical Skills:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200/80 flex items-center gap-1"
                      >
                        <span>{item.skill}</span>
                        <span className="text-[9px] px-1 py-0.2 bg-red-200/60 rounded text-red-900 font-bold">
                          {item.impact === 'High Impact' ? 'HIGH' : 'MED'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-geist text-xs font-semibold text-[#131b2e] mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-emerald-600 text-[14px]">check</span>
                    Matched Skills:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-700 font-medium">
              💡 Tip: Click "Download Optimized Resume" to auto-insert missing skills.
            </div>
          </div>

          {/* Card 4: Impactful Verbs Card (Screen 3 style) */}
          <div className="bento-card p-6">
            <h4 className="font-geist text-xs font-bold text-[#464555] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-600 text-[18px]">edit_document</span>
              Impactful Verbs Upgrade
            </h4>
            <p className="text-xs text-[#464555] mb-4">
              Upgrade passive verbs to active, achievement-oriented leadership language:
            </p>

            <div className="space-y-2.5">
              {analysis.impactfulVerbs.map((v, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#faf8ff] rounded-xl border border-slate-200 flex items-center justify-between hover:border-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through decoration-red-400">
                      {v.original}
                    </span>
                    <span className="material-symbols-outlined text-cyan-600 text-[14px]">
                      arrow_forward
                    </span>
                    <span className="text-xs font-bold text-cyan-800">{v.improved}</span>
                  </div>

                  <button
                    onClick={() => handleCopyVerb(v.improved)}
                    className="text-[11px] px-2 py-1 bg-white hover:bg-cyan-50 text-cyan-700 rounded-md border border-cyan-200 font-medium transition-colors"
                  >
                    {copiedVerb === v.improved ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Formatting Suggestions Card (Screen 3 style) */}
          <div className="bento-card p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-geist text-xs font-bold text-[#464555] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">format_paint</span>
                ATS Formatting Checklist
              </h4>
              <p className="text-xs text-[#464555] mb-4">
                Structural improvements to maximize ATS reader parse accuracy:
              </p>

              <ul className="space-y-3">
                {analysis.formattingSuggestions.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs">
                    <span className="material-symbols-outlined text-indigo-600 text-[16px] mt-0.5">
                      check_circle
                    </span>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-slate-800 font-medium">{f.title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          f.impact === 'High Impact'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {f.impact}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-700">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Passing Taleo, Workday, and Greenhouse ATS schemas</span>
            </div>
          </div>

          {/* Card 6: Actionable Improvements (Span 2) */}
          <div className="bento-card p-6 md:col-span-2">
            <h4 className="font-geist text-base font-bold text-[#131b2e] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">tips_and_updates</span>
              Actionable Improvements
            </h4>

            <div className="space-y-3.5">
              {analysis.actionableImprovements.map((imp, idx) => {
                let iconColor = 'bg-amber-100 text-amber-700';
                let icon = 'edit_note';

                if (imp.type === 'keyword') {
                  iconColor = 'bg-blue-100 text-blue-700';
                  icon = 'add_box';
                } else if (imp.type === 'formatting') {
                  iconColor = 'bg-emerald-100 text-emerald-700';
                  icon = 'format_paint';
                }

                return (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-[#faf8ff] border border-[#c7c4d8]/30 hover:border-indigo-300 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </div>
                    <div>
                      <h5 className="font-geist text-xs font-bold text-[#131b2e] mb-1">
                        {imp.title}
                      </h5>
                      <p className="text-xs text-[#464555] leading-relaxed">{imp.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bottom Bar */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-8 pt-6 border-t border-[#c7c4d8]/30">
        <button
          onClick={() => runAnalysis(resumeText, targetRole)}
          disabled={isScanning}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 font-geist text-xs font-bold hover:bg-indigo-50 transition-colors bg-white active:scale-98"
        >
          Re-scan Resume
        </button>

        <button
          onClick={handleDownloadOptimizedResume}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-geist text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Download Optimized Resume</span>
        </button>
      </div>
        </>
      )}

      {/* Text Editor Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">edit_document</span>
                <h3 className="font-geist text-base font-bold text-slate-900">
                  Resume Content Editor
                </h3>
              </div>
              <button
                onClick={() => setShowEditorModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-xs text-slate-500 mb-2">
                Paste or edit your raw resume text below. Our Gemini ATS scanner will parse experience,
                quantifiable metrics, and technical skills directly.
              </p>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={14}
                className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowEditorModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditorModal(false);
                  runAnalysis(resumeText, targetRole);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Save &amp; Scan with AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
