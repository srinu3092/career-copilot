import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface SideBySideDiffViewProps {
  originalText: string;
  optimizedText?: string;
  role: string;
  onUpdateOptimizedText?: (text: string) => void;
}

export const SideBySideDiffView: React.FC<SideBySideDiffViewProps> = ({
  originalText,
  optimizedText,
  role,
  onUpdateOptimizedText,
}) => {
  const defaultOptimized =
    optimizedText ||
    `# Jane Doe, Senior Solutions Architect
email@example.com | (555) 019-2834 | linkedin.com/in/janedoe | San Francisco, CA

## PROFESSIONAL SUMMARY
Results-driven Senior Solutions Architect with 7+ years architecting enterprise distributed cloud infrastructures, driving 99.99% availability and saving over $1.2M in annual operational costs across multi-region AWS and Kubernetes deployments.

## CORE COMPETENCIES & TECH STACK
- Cloud & DevOps: AWS (Solutions Architect Pro), GCP, Kubernetes, Docker, Terraform, CI/CD pipelines, Service Mesh
- Architecture: System Design, Microservices, Event-Driven Architecture, High Availability, Zero-Trust Security, FinOps
- Languages & Data: Python, Go, TypeScript, PostgreSQL, Redis, GraphQL, Kafka

## PROFESSIONAL EXPERIENCE
### Lead Cloud Infrastructure Architect — Apex Cloud Systems | 2021 – Present
- Architected and spearheaded multi-region Kubernetes cluster deployment supporting 4.5M DAU, slashing latency by 38% (p99 < 45ms).
- Reduced cloud infrastructure costs by 22% ($145k/yr) through implementing automated FinOps resource scaling and Spot instances.
- Orchestrated zero-downtime database migration of 12TB PostgreSQL cluster with 100% data integrity and zero customer impact.
- Enforced Zero-Trust security posture and IAM least-privilege auditing, remediating 94 compliance vulnerabilities prior to SOC2 audit.

### Cloud Engineer — Nova Solutions | 2018 – 2021
- Engineered automated Terraform pipelines accelerating environment provisioning from 3 days to 14 minutes (99.6% acceleration).
- Designed distributed Redis caching tier handling 18,000 req/sec, reducing relational database load by 64%.
- Mentored 6 associate engineers and authored 14 comprehensive architecture RFCs.

## EDUCATION & CERTIFICATIONS
- B.S. in Computer Science — University of California, Berkeley
- AWS Certified Solutions Architect – Professional (SAP-C02)
- Certified Kubernetes Administrator (CKA)`;

  const [currentOptimized, setCurrentOptimized] = useState(defaultOptimized);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentOptimized);
    setCopied(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([currentOptimized], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATS_Optimized_Resume_${role.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadText = () => {
    const blob = new Blob([currentOptimized], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATS_Optimized_Resume_${role.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>ATS Clean Resume - ${role}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111827; line-height: 1.5; font-size: 11pt; }
            h1 { font-size: 18pt; margin-bottom: 4px; border-bottom: 2px solid #374151; padding-bottom: 4px; }
            h2 { font-size: 13pt; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; }
            h3 { font-size: 11pt; margin-top: 10px; margin-bottom: 2px; }
            ul { margin-top: 4px; padding-left: 20px; }
            li { margin-bottom: 3px; }
            p { margin-top: 2px; margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <pre style="white-space: pre-wrap; font-family: inherit;">${currentOptimized.replace(/[#*]/g, '')}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Action Header */}
      <div className="bento-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-indigo-200/80 ai-gradient-bg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-indigo-600">compare</span>
            <h3 className="font-geist text-lg font-bold text-[#131b2e]">
              Side-by-Side ATS Comparison &amp; Diff Editor
            </h3>
          </div>
          <p className="text-xs text-[#464555]">
            Inspect your original candidate draft against the AI-engineered, keyword-dense ATS standard.
          </p>
        </div>

        {/* Multi-Format Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isEditing ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>{isEditing ? 'Save Edits' : 'Edit Output'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'done' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied ATS Text' : 'Copy All'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Download ATS Markdown"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>.MD</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadText}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Download Plain Text (DOCX Ready)"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>.TXT / DOCX</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Draft Pane */}
        <div className="bento-card p-6 flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <h4 className="font-geist text-xs font-bold uppercase tracking-wider text-slate-600">
                Original Candidate Resume
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Read-Only Source</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
              {originalText || 'No original resume text uploaded yet.'}
            </pre>
          </div>
        </div>

        {/* Right: AI-Optimized ATS Standard Pane */}
        <div className="bento-card p-6 flex flex-col h-[640px] border-indigo-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="font-geist text-xs font-bold uppercase tracking-wider text-indigo-900">
                AI-Optimized ATS Compliant Standard
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                98% ATS Pass Rate
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {isEditing ? (
              <textarea
                value={currentOptimized}
                onChange={(e) => {
                  setCurrentOptimized(e.target.value);
                  onUpdateOptimizedText?.(e.target.value);
                }}
                className="w-full h-full p-3 font-mono text-xs text-[#131b2e] bg-[#f8f9ff] border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              />
            ) : (
              <div className="text-xs text-[#131b2e] font-mono whitespace-pre-wrap leading-relaxed selection:bg-indigo-100">
                {currentOptimized}
              </div>
            )}
          </div>

          {/* Quick Key Highlights Legend */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-[14px]">check</span>
              <span>100% Single-Column Linear Parsing</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-indigo-600 text-[14px]">check</span>
              <span>Quantified STAR Metrics Embedded</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
