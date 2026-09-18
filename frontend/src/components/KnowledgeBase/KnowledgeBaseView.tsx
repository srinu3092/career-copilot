import React, { useState } from 'react';

export const KnowledgeBaseView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ats' | 'interview' | 'salary'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const articles = [
    {
      id: '1',
      category: 'ats',
      title: 'How Modern ATS Parsers Score Your Resume (2025 Guide)',
      desc: 'Understand Taleo, Workday, and Greenhouse parsing algorithms, boolean search mechanics, and why formatting tables break scan accuracy.',
      readTime: '4 min read',
      badge: 'ATS Guide',
    },
    {
      id: '2',
      category: 'interview',
      title: 'The Advanced STAR Framework for Executive & Senior Roles',
      desc: 'Master the Situation-Task-Action-Result structure with quantifiable metrics, clear trade-off analysis, and proactive leadership storytelling.',
      readTime: '6 min read',
      badge: 'STAR Method',
    },
    {
      id: '3',
      category: 'salary',
      title: 'FAANG Total Compensation Negotiation Scripts',
      desc: 'Word-for-word counter-offer templates, sign-on bonus escalation strategies, and RSU equity vesting trade-offs.',
      readTime: '5 min read',
      badge: 'Negotiation',
    },
    {
      id: '4',
      category: 'interview',
      title: 'Top 25 System Design Interview Archetypes',
      desc: 'Deep dives on URL shorteners, distributed rate limiters, web crawlers, payment processors, and real-time chat architecture.',
      readTime: '8 min read',
      badge: 'System Design',
    },
    {
      id: '5',
      category: 'ats',
      title: '50 Powerful Leadership Action Verbs that Replace "Helped" and "Managed"',
      desc: 'Upgrade passive resume language to high-impact verbs like Spearheaded, Orchestrated, Engineered, and Formulated.',
      readTime: '3 min read',
      badge: 'Resume Vocabulary',
    },
    {
      id: '6',
      category: 'salary',
      title: 'Evaluating Base vs Equity in Pre-IPO vs Public Tech',
      desc: 'How to calculate expected value of stock options vs liquid RSUs and negotiate accelerated vesting clauses.',
      readTime: '5 min read',
      badge: 'Equity Guide',
    },
  ];

  const filteredArticles = articles.filter((a) => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-geist text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
            Career Knowledge Base
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            FAANG &amp; Tech Playbooks
          </span>
        </div>
        <p className="text-sm text-[#464555]">
          Curated frameworks, ATS formatting rules, interview question banks, and compensation negotiation scripts.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'ats', label: 'ATS & Resumes' },
            { id: 'interview', label: 'Interview Frameworks' },
            { id: 'salary', label: 'Salary Negotiation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles & scripts..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Bento Grid Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="bento-card p-6 flex flex-col justify-between hover:border-indigo-400 transition-all group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                  {art.badge}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{art.readTime}</span>
              </div>

              <h3 className="font-geist text-sm font-bold text-[#131b2e] mb-2 group-hover:text-indigo-600 transition-colors">
                {art.title}
              </h3>
              <p className="text-xs text-[#464555] leading-relaxed mb-4">{art.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>Read playbook</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
