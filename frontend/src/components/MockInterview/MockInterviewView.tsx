import React, { useState, useEffect, useRef } from 'react';
import {
  InterviewMessage,
  InterviewSettings,
  InterviewMode,
  InterviewDifficulty,
  InterviewCompetencyScores,
  InterviewTurnMetric,
  InterviewerPersona,
} from '../../types.ts';
import { INTERVIEWER_PERSONAS } from './InterviewPersonas.ts';
import { VoiceVideoStage } from './VoiceVideoStage.tsx';
import { ChatModeStage } from './ChatModeStage.tsx';
import { AnalyticsStage } from './AnalyticsStage.tsx';
import { BarRaiserVerdictModal } from './BarRaiserVerdictModal.tsx';
import { BarRaiserEvaluation } from '../../types.ts';
import { saveHistoryItem } from '../../utils/historyStorage.ts';
import confetti from 'canvas-confetti';

interface MockInterviewViewProps {
  initialRole?: string;
  onOpenUpgradeModal: () => void;
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({
  initialRole = 'Senior Solutions Architect',
  onOpenUpgradeModal,
}) => {
  // Mode: voice-video | chat | analytics
  const [activeMode, setActiveMode] = useState<InterviewMode>('voice-video');

  const [settings, setSettings] = useState<InterviewSettings>({
    company: 'Google',
    role: initialRole,
    interviewType: 'System Design & Leadership',
    difficulty: 'Senior',
    interviewerId: INTERVIEWER_PERSONAS[0].id,
    liveFeedbackEnabled: true,
  });

  const [currentInterviewer, setCurrentInterviewer] = useState<InterviewerPersona>(
    INTERVIEWER_PERSONAS[0]
  );

  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [userSpeechInput, setUserSpeechInput] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [handsFreeAutoSubmit, setHandsFreeAutoSubmit] = useState(false);

  // Bar Raiser Scorecard State
  const [barRaiserEvaluation, setBarRaiserEvaluation] = useState<BarRaiserEvaluation | null>(null);
  const [isBarRaiserModalOpen, setIsBarRaiserModalOpen] = useState(false);
  const [isGeneratingScorecard, setIsGeneratingScorecard] = useState(false);

  // Real-time Coaching State
  const [liveHint, setLiveHint] = useState(
    'Apply the STAR method: Clearly state the Situation and Task before diving into your Actions.'
  );
  const [communicationScore, setCommunicationScore] = useState(85);
  const [confidenceStatus, setConfidenceStatus] = useState<'Strong' | 'Moderate' | 'Needs Polish'>(
    'Strong'
  );

  // Competency Metrics & Turn history
  const [competencyScores, setCompetencyScores] = useState<InterviewCompetencyScores>({
    starStructure: 88,
    technicalDepth: 84,
    deliveryClarity: 90,
    leadershipImpact: 86,
    conciseness: 85,
  });

  const [turnMetrics, setTurnMetrics] = useState<InterviewTurnMetric[]>([
    {
      turnNumber: 1,
      questionPreview: 'Can you walk me through a complex technical or strategic project...',
      score: 85,
      wordCount: 120,
      fillerWordsCount: 1,
      wpm: 130,
      starScore: 88,
      timestamp: '10:00 AM',
    },
  ]);

  const [transcript, setTranscript] = useState<InterviewMessage[]>([
    {
      id: '1',
      sender: 'interviewer',
      text: `Welcome to the ${settings.company} mock interview for the ${settings.role} role. I'm ${currentInterviewer.name}. Let's dive in: Can you walk me through a complex technical project you spearheaded that had high architectural stakes and tight business deadlines?`,
      timestamp: '10:00 AM',
    },
  ]);

  const [sessionDurationSec, setSessionDurationSec] = useState(0);

  // Timer counter
  useEffect(() => {
    if (!isSessionActive) return;
    const interval = setInterval(() => {
      setSessionDurationSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Switch interviewer persona
  const handleSelectInterviewer = (persona: InterviewerPersona) => {
    setCurrentInterviewer(persona);
    setSettings((prev) => ({ ...prev, interviewerId: persona.id }));

    // Greet with new interviewer
    const newGreeting: InterviewMessage = {
      id: Date.now().toString(),
      sender: 'interviewer',
      text: `Hi there, I'm ${persona.name} (${persona.roleTitle}). I'll be conducting your ${settings.interviewType} evaluation for ${settings.company}. Tell me about a time you had to make a tough technical trade-off.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscript((prev) => [...prev, newGreeting]);
    speakQuestion(newGreeting.text, persona);
  };

  // Text-To-Speech
  const speakQuestion = (text: string, persona: InterviewerPersona = currentInterviewer) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = persona.voiceGender === 'female' ? 1.1 : 0.95;

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find((v) =>
        persona.voiceGender === 'female'
          ? v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English')
          : v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male')
      );
      if (preferred) utterance.voice = preferred;
    }

    setIsAgentSpeaking(true);
    utterance.onend = () => setIsAgentSpeaking(false);
    utterance.onerror = () => setIsAgentSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Replay latest question
  const handleReplayLatestQuestion = () => {
    const lastInterviewerMsg = [...transcript].reverse().find((m) => m.sender === 'interviewer');
    if (lastInterviewerMsg) {
      speakQuestion(lastInterviewerMsg.text, currentInterviewer);
    }
  };

  // Store the initial text when the mic starts to avoid duplication
  const latestSpeechInputRef = useRef(userSpeechInput);
  useEffect(() => {
    latestSpeechInputRef.current = userSpeechInput;
  }); // updates on every render

  const speechInitialTextRef = useRef('');

  useEffect(() => {
    if (isMicOn) {
      speechInitialTextRef.current = latestSpeechInputRef.current;
    }
  }, [isMicOn]);

  // Speech Recognition
  useEffect(() => {
    let recognition: any = null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isMicOn && SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Capture the starting text when the mic is turned on
      const initialText = speechInitialTextRef.current;

      recognition.onresult = (event: any) => {
        let sessionTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          sessionTranscript += event.results[i][0].transcript;
        }
        setUserSpeechInput(
          initialText
            ? `${initialText.trim()} ${sessionTranscript.trim()}`
            : sessionTranscript.trim()
        );
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsMicOn(false);
      };

      try {
        recognition.start();
      } catch (e) {
        // already started
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isMicOn]);

  const handleSendResponse = async (customText?: string) => {
    const textToSend = customText || userSpeechInput;
    if (!textToSend.trim() || isEvaluating) return;

    const userMessage: InterviewMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedTranscript = [...transcript, userMessage];
    setTranscript(updatedTranscript);
    setUserSpeechInput('');
    setIsEvaluating(true);
    setIsMicOn(false);

    try {
      const response = await fetch('/api/mock-interview-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: settings.company,
          role: settings.role,
          interviewType: settings.interviewType,
          difficulty: settings.difficulty,
          interviewerName: currentInterviewer.name,
          history: updatedTranscript.map((t) => ({ sender: t.sender, text: t.text })),
          latestUserResponse: textToSend.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Interview turn request failed');
      }

      const data = await response.json();

      setLiveHint(data.liveHint || 'Ensure you quantify your Result with exact metrics.');
      if (data.communicationScore) setCommunicationScore(data.communicationScore);
      if (data.confidenceStatus) setConfidenceStatus(data.confidenceStatus);
      if (data.competencyScores) setCompetencyScores(data.competencyScores);

      // Add to turn metrics for charts
      const wordCount = textToSend.trim().split(/\s+/).length;
      const turnNum = turnMetrics.length + 1;
      const newTurnMetric: InterviewTurnMetric = {
        turnNumber: turnNum,
        questionPreview: data.nextQuestion.slice(0, 45) + '...',
        score: data.communicationScore || 85,
        wordCount,
        fillerWordsCount: data.fillerWordsFound?.length || 0,
        wpm: Math.round(120 + Math.random() * 20),
        starScore: data.competencyScores?.starStructure || 88,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTurnMetrics((prev) => [...prev, newTurnMetric]);

      // Add interviewer follow-up
      const interviewerMsg: InterviewMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'interviewer',
        text: data.nextQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: data.feedbackTip,
      };

      setTranscript((prev) => [...prev, interviewerMsg]);
      speakQuestion(data.nextQuestion, currentInterviewer);
    } catch (err) {
      console.error('Error in mock interview turn:', err);
      const fallbackQuestion =
        "That's a very compelling approach. How did you quantify the direct business impact, and what trade-offs did you evaluate?";
      const fallbackMsg: InterviewMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'interviewer',
        text: fallbackQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTranscript((prev) => [...prev, fallbackMsg]);
      speakQuestion(fallbackQuestion, currentInterviewer);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleGenerateBarRaiserVerdict = async () => {
    setIsGeneratingScorecard(true);
    try {
      const response = await fetch('/api/bar-raiser-scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: settings.company,
          role: settings.role,
          transcript: transcript.map((t) => ({ sender: t.sender, text: t.text })),
          interviewerName: currentInterviewer.name,
          difficulty: settings.difficulty,
        }),
      });

      if (!response.ok) throw new Error('Scorecard generation failed');
      const data: BarRaiserEvaluation = await response.json();
      setBarRaiserEvaluation(data);
      setIsBarRaiserModalOpen(true);

      // Save to persistent session history
      saveHistoryItem({
        type: 'interview_session',
        title: `${settings.company} - ${settings.role} Mock Interview`,
        subtitle: `${currentInterviewer.name} • ${data.verdict.toUpperCase()} (${data.confidenceScore}%)`,
        score: data.confidenceScore,
        data: {
          company: settings.company,
          role: settings.role,
          interviewer: currentInterviewer.name,
          evaluation: data,
          turnsCount: transcript.filter((t) => t.sender === 'user').length,
        },
      });

      if (data.verdict === 'Strong Hire' || data.verdict === 'Hire') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Error generating Bar Raiser scorecard:', err);
    } finally {
      setIsGeneratingScorecard(false);
    }
  };

  const handleRestartSession = () => {
    setIsSessionActive(true);
    setSessionDurationSec(0);
    const initialMsg: InterviewMessage = {
      id: Date.now().toString(),
      sender: 'interviewer',
      text: `Hello! I'm ${currentInterviewer.name}. Welcome to your ${settings.difficulty} interview for ${settings.role} at ${settings.company}. Tell me about your most impactful engineering or leadership achievement.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTranscript([initialMsg]);
    setTurnMetrics([]);
    speakQuestion(initialMsg.text, currentInterviewer);
  };

  const latestInterviewerMsg =
    [...transcript].reverse().find((m) => m.sender === 'interviewer')?.text ||
    "Let's begin your interview.";

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Mode Toggle Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="font-geist text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
              AI Mock Interview Simulator
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              Live Agent 2.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#464555]">
            Practice with elite FAANG bar raisers. Get instant speech analysis, STAR methodology guidance, and competency scorecards.
          </p>
        </div>

        {/* Mode Selector Tabs: Voice/Video, Chat, Charts */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveMode('voice-video')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeMode === 'voice-video'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">videocam</span>
              <span>Voice &amp; Video</span>
            </button>

            <button
              onClick={() => setActiveMode('chat')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeMode === 'chat'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Chat Mode</span>
            </button>

            <button
              onClick={() => setActiveMode('analytics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeMode === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              <span>Performance Charts</span>
            </button>
          </div>

          {/* Bar Raiser Final Decision Trigger */}
          <button
            type="button"
            onClick={handleGenerateBarRaiserVerdict}
            disabled={isGeneratingScorecard}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-[#06B6D4] hover:opacity-95 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isGeneratingScorecard ? 'hourglass_top' : 'gavel'}
            </span>
            <span>
              {isGeneratingScorecard ? 'Evaluating Hiring Bar...' : 'Official Bar Raiser Verdict'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3 Columns on Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Role & Interviewer Persona (Span 3) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Target Role & Setup Bento */}
          <div className="bento-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-geist text-xs font-bold text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">tune</span>
                Session Target
              </h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span>{formatTimer(sessionDurationSec)}</span>
              </div>
            </div>

            <div>
              <label className="font-geist text-xs font-medium text-[#464555] mb-1 block">
                Target Company
              </label>
              <select
                value={settings.company}
                onChange={(e) => setSettings({ ...settings, company: e.target.value })}
                className="w-full bg-[#f2f3ff] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="Google">Google</option>
                <option value="Amazon">Amazon</option>
                <option value="Meta">Meta</option>
                <option value="Apple">Apple</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Netflix">Netflix</option>
                <option value="Stripe">Stripe</option>
              </select>
            </div>

            <div>
              <label className="font-geist text-xs font-medium text-[#464555] mb-1 block">
                Target Role
              </label>
              <input
                type="text"
                value={settings.role}
                onChange={(e) => setSettings({ ...settings, role: e.target.value })}
                className="w-full bg-[#f2f3ff] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-geist text-xs font-medium text-[#464555] mb-1 block">
                Seniority Level
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) =>
                  setSettings({ ...settings, difficulty: e.target.value as InterviewDifficulty })
                }
                className="w-full bg-[#f2f3ff] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Staff / Principal">Staff / Principal</option>
                <option value="Executive / VP">Executive / VP</option>
              </select>
            </div>
          </div>

          {/* Interviewer Persona Picker Bento */}
          <div className="bento-card p-5 space-y-3">
            <h3 className="font-geist text-xs font-bold text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">groups</span>
              Select Interviewer
            </h3>

            <div className="space-y-2">
              {INTERVIEWER_PERSONAS.map((persona) => {
                const isSelected = currentInterviewer.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectInterviewer(persona)}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={persona.avatarUrl}
                      alt={persona.name}
                      className="w-10 h-10 rounded-full object-cover border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-geist text-xs font-bold text-[#131b2e] truncate">
                          {persona.name}
                        </span>
                        <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-100/70 px-1.5 py-0.5 rounded-md">
                          {persona.badge.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#464555] truncate">{persona.roleTitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restart / Reset Session Button */}
          <button
            onClick={handleRestartSession}
            className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Interview Session</span>
          </button>
        </div>

        {/* Center Column: Interactive Stage (Span 6) */}
        <div className="lg:col-span-6">
          {activeMode === 'voice-video' && (
            <VoiceVideoStage
              currentInterviewer={currentInterviewer}
              latestQuestion={latestInterviewerMsg}
              isAgentSpeaking={isAgentSpeaking}
              isEvaluating={isEvaluating}
              isMicOn={isMicOn}
              setIsMicOn={setIsMicOn}
              isCameraOn={isCameraOn}
              setIsCameraOn={setIsCameraOn}
              userSpeechInput={userSpeechInput}
              setUserSpeechInput={setUserSpeechInput}
              onSendResponse={handleSendResponse}
              onReplayQuestion={handleReplayLatestQuestion}
              ttsEnabled={ttsEnabled}
              setTtsEnabled={setTtsEnabled}
            />
          )}

          {activeMode === 'chat' && (
            <ChatModeStage
              transcript={transcript}
              currentInterviewer={currentInterviewer}
              isEvaluating={isEvaluating}
              userSpeechInput={userSpeechInput}
              setUserSpeechInput={setUserSpeechInput}
              onSendResponse={handleSendResponse}
              onSpeakText={(txt) => speakQuestion(txt, currentInterviewer)}
              isMicOn={isMicOn}
              setIsMicOn={setIsMicOn}
            />
          )}

          {activeMode === 'analytics' && (
            <AnalyticsStage
              competencyScores={competencyScores}
              turnMetrics={turnMetrics}
              currentInterviewer={currentInterviewer}
              targetRole={settings.role}
              targetCompany={settings.company}
              overallScore={communicationScore}
              onRestartSession={handleRestartSession}
            />
          )}
        </div>

        {/* Right Column: Real-time STAR Feedback & Scoring (Span 3) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Real-time Communication Score Card */}
          <div className="bento-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Turn Score
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {confidenceStatus}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-geist text-3xl font-black text-indigo-600">
                {communicationScore}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Hiring Bar Match</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${communicationScore}%` }}
              />
            </div>

            {/* STAR Checklist Indicator */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block">STAR Rubric:</span>
              {[
                { label: 'Situation (Context & Scale)', status: 'pass' },
                { label: 'Task (Your Direct Responsibility)', status: 'pass' },
                { label: 'Action (Engineering & Execution)', status: 'pass' },
                { label: 'Result (Metrics & Business ROI)', status: 'warning' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{step.label}</span>
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      step.status === 'pass' ? 'text-emerald-600' : 'text-amber-500'
                    }`}
                  >
                    {step.status === 'pass' ? 'check_circle' : 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time STAR Live Hint Bento */}
          <div className="bento-card p-5 border-indigo-200/80 bg-indigo-50/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">
                psychology
              </span>
              <h3 className="font-geist text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Live STAR Coach Hint
              </h3>
            </div>
            <p className="text-xs text-indigo-950 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-indigo-100">
              {liveHint}
            </p>
          </div>

          {/* Quick Switch to View Charts */}
          {activeMode !== 'analytics' && (
            <div className="bento-card p-4 text-center">
              <p className="text-xs text-slate-600 mb-2">
                Want to review your 5D Competency Radar &amp; score trajectory?
              </p>
              <button
                onClick={() => setActiveMode('analytics')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                <span>View Full Performance Charts</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Bar Raiser Verdict Scorecard Modal */}
      <BarRaiserVerdictModal
        isOpen={isBarRaiserModalOpen}
        onClose={() => setIsBarRaiserModalOpen(false)}
        evaluation={barRaiserEvaluation}
        company={settings.company}
        role={settings.role}
        interviewerName={currentInterviewer.name}
      />
    </div>
  );
};
