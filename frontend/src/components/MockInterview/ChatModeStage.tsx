import React, { useRef, useEffect } from 'react';
import { InterviewMessage, InterviewerPersona } from '../../types.ts';

interface ChatModeStageProps {
  transcript: InterviewMessage[];
  currentInterviewer: InterviewerPersona;
  isEvaluating: boolean;
  userSpeechInput: string;
  setUserSpeechInput: React.Dispatch<React.SetStateAction<string>>;
  onSendResponse: (customText?: string) => void;
  onSpeakText: (text: string) => void;
  isMicOn: boolean;
  setIsMicOn: (on: boolean) => void;
}

export const ChatModeStage: React.FC<ChatModeStageProps> = ({
  transcript,
  currentInterviewer,
  isEvaluating,
  userSpeechInput,
  setUserSpeechInput,
  onSendResponse,
  onSpeakText,
  isMicOn,
  setIsMicOn,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isEvaluating]);

  const quickStarStarters = [
    'The core situation was...',
    'My objective and task were...',
    'To resolve this, I engineered...',
    'The measurable result was a 40% improvement in...',
  ];

  return (
    <div className="bento-card p-4 sm:p-6 flex flex-col h-[650px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={currentInterviewer.avatarUrl}
            alt={currentInterviewer.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-geist text-sm font-bold text-[#131b2e]">
                {currentInterviewer.name}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                {currentInterviewer.badge}
              </span>
            </div>
            <p className="text-[11px] text-[#464555]">
              {currentInterviewer.roleTitle} &bull; {currentInterviewer.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Chat Mode</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {transcript.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } space-y-1`}
          >
            <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
              <span className="font-semibold text-slate-600">
                {msg.sender === 'user' ? 'Candidate (You)' : currentInterviewer.name}
              </span>
              <span>&bull;</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-xs relative group ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                  : 'bg-[#faf8ff] border border-slate-200/80 text-[#131b2e] rounded-tl-xs'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* In-message Audio Replay for Interviewer */}
              {msg.sender === 'interviewer' && (
                <button
                  onClick={() => onSpeakText(msg.text)}
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                  title="Listen to this question"
                >
                  <span className="material-symbols-outlined text-[14px]">volume_up</span>
                  <span>Listen to Question</span>
                </button>
              )}

              {/* In-line Feedback Note if present */}
              {msg.feedback && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-indigo-900 bg-indigo-50/80 p-2 rounded-xl">
                  <span className="material-symbols-outlined text-indigo-600 text-[16px] shrink-0 mt-0.5">
                    lightbulb
                  </span>
                  <span>
                    <strong>Coaching Tip:</strong> {msg.feedback}
                  </span>
                </div>
              )}
            </div>

            {/* Score & STAR pills for candidate turns */}
            {msg.sender === 'user' && msg.score && (
              <div className="flex items-center gap-1.5 px-1 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Score: {msg.score}/100
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  STAR structure verified
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Evaluating loader */}
        {isEvaluating && (
          <div className="flex items-start gap-2 animate-in fade-in">
            <img
              src={currentInterviewer.avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-indigo-200"
            />
            <div className="bg-[#faf8ff] border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-indigo-700 font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1 text-slate-600">
                {currentInterviewer.name} is evaluating your STAR response...
              </span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Chat Footer & Input */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        {/* Quick STAR Phrase Chips */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            STAR:
          </span>
          {quickStarStarters.map((starter, i) => (
            <button
              key={i}
              type="button"
              onClick={() =>
                setUserSpeechInput((prev) => (prev ? `${prev} ${starter}` : starter))
              }
              className="text-[10px] bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-md px-2 py-0.5 transition-colors"
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isMicOn
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isMicOn ? 'Stop voice recording' : 'Dictate with voice'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMicOn ? 'mic_off' : 'mic'}
            </span>
          </button>

          <input
            type="text"
            value={userSpeechInput}
            onChange={(e) => setUserSpeechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSendResponse();
              }
            }}
            placeholder="Type or dictate your STAR interview answer..."
            className="flex-1 bg-[#f2f3ff] border border-slate-200 rounded-xl px-4 py-2.5 text-xs md:text-sm font-medium text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600"
          />

          <button
            type="button"
            onClick={() => onSendResponse()}
            disabled={!userSpeechInput.trim() || isEvaluating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-geist text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
