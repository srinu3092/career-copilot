import React, { useState } from 'react';
import { AgentProfile, ChatMessage } from '../../types.ts';

const AGENT_PROFILES: AgentProfile[] = [
  {
    id: 'resume',
    name: 'ATS & Resume Strategist',
    title: 'Executive Career Strategist',
    avatarIcon: 'description',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Expert in ATS parsers, STAR method bullets, and quantifiable impact positioning.',
    starterQuestions: [
      'How do I rewrite my resume bullets using the STAR method?',
      'How can I pass Taleo and Workday ATS keyword filters?',
      'Can you review my summary for a Senior Solutions Architect role?',
    ],
  },
  {
    id: 'salary',
    name: 'Offer & Compensation Negotiator',
    title: 'Executive Comp Specialist',
    avatarIcon: 'payments',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Master in counter-offer strategy, equity vs base tradeoffs, and negotiation scripts.',
    starterQuestions: [
      'How do I respond to an initial offer without leaving money on the table?',
      'What is a competitive total compensation breakdown for L5/Senior roles in Bay Area?',
      'Write me a professional email to counter a base salary offer.',
    ],
  },
  {
    id: 'technical',
    name: 'System Design & Tech Coach',
    title: 'Principal Systems Architect',
    avatarIcon: 'architecture',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Guides you through high-scale architectures, distributed systems, and technical trade-offs.',
    starterQuestions: [
      'How do I approach a system design question for a distributed rate limiter?',
      'Explain caching strategies: Redis vs Memcached and Write-Through vs Write-Back.',
      'What trade-offs should I highlight when choosing SQL vs NoSQL?',
    ],
  },
  {
    id: 'behavioral',
    name: 'Leadership & Behavioral Coach',
    title: 'FAANG Interview Bar Raiser',
    avatarIcon: 'psychology',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Specializes in Amazon Leadership Principles, Googleyness, and high-impact storytelling.',
    starterQuestions: [
      'Give me a framework for: "Tell me about a time you disagreed and committed."',
      'How do I answer: "What is your biggest failure as an engineering leader?"',
      'Help me structure an answer around managing cross-functional stakeholder conflict.',
    ],
  },
];

export const MultiAgentChatView: React.FC = () => {
  const [activeAgentId, setActiveAgentId] = useState<AgentProfile['id']>('resume');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      agentId: 'resume',
      text: 'Hello! I am your ATS & Resume Strategist. Share any bullet point or resume section you want to optimize for maximum ATS scores and hiring manager impact.',
      timestamp: '10:15 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeAgent = AGENT_PROFILES.find((a) => a.id === activeAgentId) || AGENT_PROFILES[0];

  const handleSelectAgent = (agent: AgentProfile) => {
    setActiveAgentId(agent.id);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'agent',
        agentId: agent.id,
        text: `Switched to ${agent.name}. How can I assist you with your career strategy today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: activeAgentId,
          message: query.trim(),
          history: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      if (!response.ok) throw new Error('Agent failed to respond');

      const data = await response.json();
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentId: activeAgentId,
        text: data.reply || 'Here is my analysis on your inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentId: activeAgentId,
        text: `Regarding "${query.trim()}": Always frame your experience with quantifiable business impact, explicit ownership scope, and clear technical decisions!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-geist text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
            Multi-Agent Career Advisory
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-300 text-cyan-800 text-xs font-semibold">
            4 Specialist Agents
          </span>
        </div>
        <p className="text-sm text-[#464555]">
          Consult dedicated AI specialists trained on executive recruiting, compensation negotiation,
          and FAANG system design.
        </p>
      </div>

      {/* Agents Bento Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {AGENT_PROFILES.map((agent) => {
          const isSelected = activeAgentId === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => handleSelectAgent(agent)}
              className={`bento-card p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 shadow-md'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {agent.avatarIcon}
                  </span>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                )}
              </div>
              <h3 className="font-geist text-xs font-bold text-[#131b2e] mb-1">{agent.name}</h3>
              <p className="text-[11px] text-[#464555] line-clamp-2 leading-relaxed">
                {agent.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chat Bento Container */}
      <div className="bento-card flex flex-col h-[560px] overflow-hidden border border-slate-200 shadow-sm">
        {/* Active Agent Banner */}
        <div className="p-4 bg-[#faf8ff] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">
                {activeAgent.avatarIcon}
              </span>
            </div>
            <div>
              <h3 className="font-geist text-sm font-bold text-[#131b2e] flex items-center gap-2">
                <span>{activeAgent.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${activeAgent.badgeColor}`}>
                  {activeAgent.title}
                </span>
              </h3>
              <p className="text-[11px] text-[#464555]">Powered by Gemini 3.7 Flash</p>
            </div>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: Date.now().toString(),
                  sender: 'agent',
                  agentId: activeAgentId,
                  text: `Chat history cleared. How can I help you with ${activeAgent.name}?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Clear</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                    isUser ? 'bg-cyan-600' : 'bg-indigo-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isUser ? 'person' : 'smart_toy'}
                  </span>
                </div>

                <div className={`max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="font-geist text-[10px] font-medium text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-[#faf8ff] text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              </div>
              <div className="p-3 bg-[#faf8ff] rounded-2xl rounded-tl-xs border border-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
              </div>
            </div>
          )}
        </div>

        {/* Starter Chips */}
        <div className="px-4 py-2 bg-[#f2f3ff]/50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Quick Prompts:</span>
          {activeAgent.starterQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/70 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask ${activeAgent.name}...`}
            className="flex-1 px-4 py-2.5 text-xs bg-[#f2f3ff] rounded-xl border border-transparent focus:border-indigo-600 focus:bg-white outline-none text-slate-800 transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-geist text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
