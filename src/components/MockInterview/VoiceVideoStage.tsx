import React, { useRef, useEffect } from 'react';
import { InterviewerPersona } from '../../types.ts';

interface VoiceVideoStageProps {
  currentInterviewer: InterviewerPersona;
  latestQuestion: string;
  isAgentSpeaking: boolean;
  isEvaluating: boolean;
  isMicOn: boolean;
  setIsMicOn: (on: boolean) => void;
  isCameraOn: boolean;
  setIsCameraOn: (on: boolean) => void;
  userSpeechInput: string;
  setUserSpeechInput: (text: string) => void;
  onSendResponse: (customText?: string) => void;
  onReplayQuestion: () => void;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
}

export const VoiceVideoStage: React.FC<VoiceVideoStageProps> = ({
  currentInterviewer,
  latestQuestion,
  isAgentSpeaking,
  isEvaluating,
  isMicOn,
  setIsMicOn,
  isCameraOn,
  setIsCameraOn,
  userSpeechInput,
  setUserSpeechInput,
  onSendResponse,
  onReplayQuestion,
  ttsEnabled,
  setTtsEnabled,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const waveContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isMicOn) {
      navigator.mediaDevices
        ?.getUserMedia({ audio: true, video: false })
        .then((stream) => {
          streamRef.current = stream;
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64; // Get few frequency bands
          analyserRef.current = analyser;
          
          const source = audioCtx.createMediaStreamSource(stream);
          sourceRef.current = source;
          source.connect(analyser);
          
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          dataArrayRef.current = dataArray;
          
          const updateWaveform = () => {
            if (!analyserRef.current || !dataArrayRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            
            if (waveContainerRef.current) {
              const bars = waveContainerRef.current.children;
              const len = bars.length;
              for (let i = 0; i < len; i++) {
                const bar = bars[i] as HTMLSpanElement;
                if (bar) {
                  // Get index mapped symmetrically (rising in center, sloping towards sides)
                  const dataIdx = i < len / 2 ? i : len - 1 - i;
                  const val = dataArrayRef.current[dataIdx % bufferLength] || 0;
                  const height = Math.max(15, Math.min(100, (val / 160) * 100));
                  bar.style.height = `${height}%`;
                }
              }
            }
            animationFrameRef.current = requestAnimationFrame(updateWaveform);
          };
          
          updateWaveform();
        })
        .catch((err) => {
          console.warn('Web Audio API getUserMedia failed:', err);
        });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMicOn]);

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn('Webcam stream unavailable:', err);
          setIsCameraOn(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [isCameraOn, setIsCameraOn]);

  const quickStarStarters = [
    'In my previous role, we faced a situation where...',
    'My specific responsibility was to architect and lead...',
    'I took action by engineering an automated solution that...',
    'As a quantifiable result, we reduced latency by 35% and...',
  ];

  return (
    <div className="space-y-4">
      {/* Dual Video / Virtual Stage */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl aspect-video max-h-[380px] w-full flex items-center justify-center border border-slate-800">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#0d1527] to-[#1e1b4b] opacity-90" />
        
        {/* Decorative Grid Mesh */}
        <div 
          className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"
        />

        {/* Top Status Overlay Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          {/* Agent Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isEvaluating
                  ? 'bg-amber-400 animate-ping'
                  : isAgentSpeaking
                  ? 'bg-cyan-400 animate-pulse'
                  : isMicOn
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="font-semibold text-[11px] tracking-wide">
              {isEvaluating
                ? 'Analyzing STAR Structure...'
                : isAgentSpeaking
                ? `${currentInterviewer.name} is Speaking`
                : isMicOn
                ? 'Listening to Candidate...'
                : `${currentInterviewer.name} (Ready)`}
            </span>
          </div>

          {/* Quick Voice Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`p-2 rounded-full backdrop-blur-md transition-all text-xs flex items-center gap-1.5 ${
                ttsEnabled
                  ? 'bg-indigo-600/80 text-white hover:bg-indigo-600 border border-indigo-400/40'
                  : 'bg-black/50 text-slate-400 hover:text-white border border-white/10'
              }`}
              title={ttsEnabled ? 'Voice output enabled' : 'Voice output muted'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {ttsEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <span className="text-[10px] font-medium hidden sm:inline">
                {ttsEnabled ? 'Voice On' : 'Muted'}
              </span>
            </button>

            <button
              onClick={onReplayQuestion}
              disabled={isEvaluating}
              className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
              title="Replay interviewer's question"
            >
              <span className="material-symbols-outlined text-[15px]">replay</span>
              <span className="hidden sm:inline">Replay Audio</span>
            </button>
          </div>
        </div>

        {/* Center: AI Interviewer Interactive Persona Card */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-lg">
          {/* Avatar Ring with Speaking Wave Animation */}
          <div className="relative mb-3">
            {isAgentSpeaking && (
              <>
                <div className="absolute -inset-3 rounded-full bg-cyan-500/30 animate-ping opacity-75" />
                <div className="absolute -inset-6 rounded-full bg-indigo-500/20 animate-pulse" />
              </>
            )}
            <img
              src={currentInterviewer.avatarUrl}
              alt={currentInterviewer.name}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 transition-all duration-300 shadow-2xl relative z-10 ${
                isAgentSpeaking
                  ? 'border-cyan-400 scale-105 shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                  : 'border-white/20'
              }`}
            />

            {/* Speaking Wave Equalizer Bars Overlay */}
            {isAgentSpeaking && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-end gap-1 px-2.5 py-1 rounded-full bg-slate-950/90 border border-cyan-400/50 shadow-md">
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite_100ms]"></span>
                <span className="w-1 h-5 bg-cyan-300 rounded-full animate-[bounce_0.6s_infinite_200ms]"></span>
                <span className="w-1 h-4 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite_300ms]"></span>
                <span className="w-1 h-6 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_150ms]"></span>
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite_250ms]"></span>
              </div>
            )}
          </div>

          <h4 className="font-geist text-white text-base sm:text-lg font-bold tracking-tight flex items-center gap-1.5">
            <span>{currentInterviewer.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 text-[10px] font-semibold">
              {currentInterviewer.badge}
            </span>
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            {currentInterviewer.roleTitle} &bull; {currentInterviewer.company}
          </p>
        </div>

        {/* Bottom Interviewer Subtitle Box */}
        <div className="absolute bottom-3 left-4 right-4 z-20 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-white text-xs shadow-lg max-h-24 overflow-y-auto">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-[18px] shrink-0 mt-0.5">
              format_quote
            </span>
            <p className="font-medium text-[12px] sm:text-[13px] leading-relaxed text-slate-100 line-clamp-3">
              {latestQuestion}
            </p>
          </div>
        </div>

        {/* Picture-in-Picture: Candidate Webcam Window (Bottom Right) */}
        <div className="absolute top-4 right-4 sm:top-auto sm:bottom-4 sm:right-4 z-30 w-28 sm:w-40 aspect-video rounded-xl overflow-hidden border-2 border-white/20 bg-slate-950 shadow-2xl flex items-center justify-center">
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400">
              <span className="material-symbols-outlined text-[20px] mb-0.5">videocam_off</span>
              <span className="text-[9px] font-medium">Camera Off</span>
            </div>
          )}

          {/* Toggle Camera Small Overlay Button */}
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className="absolute bottom-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-md transition-colors"
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            <span className="material-symbols-outlined text-[12px]">
              {isCameraOn ? 'videocam' : 'videocam_off'}
            </span>
          </button>
        </div>
      </div>

      {/* Candidate Audio & Speech Controller Stage */}
      <div className="bento-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">mic</span>
            <h3 className="font-geist text-sm font-bold text-[#131b2e]">
              Your Verbal Answer
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {isMicOn && (
              <span className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>Live Speech Recording...</span>
              </span>
            )}
            <span className="text-[11px] text-slate-400">
              {userSpeechInput.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>

        {/* Live Audio Waveform Animation when Mic is Active */}
        {isMicOn && (
          <div 
            ref={waveContainerRef}
            className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-center gap-1.5 h-12"
          >
            {[...Array(24)].map((_, i) => (
              <span
                key={i}
                style={{ height: '15%' }}
                className="w-1 bg-indigo-600 rounded-full transition-[height] duration-75"
              />
            ))}
          </div>
        )}

        {/* Text Input Area (Supports real-time Speech-to-Text or typing) */}
        <div className="relative">
          <textarea
            value={userSpeechInput}
            onChange={(e) => setUserSpeechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                onSendResponse();
              }
            }}
            placeholder={
              isMicOn
                ? 'Listening to your speech in real-time... Speak your answer.'
                : 'Click "Start Talking" to speak, or type your answer here...'
            }
            rows={3}
            className="w-full bg-[#f2f3ff] border border-slate-200 rounded-2xl p-4 text-xs md:text-sm font-medium text-[#131b2e] focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all resize-none"
          />
        </div>

        {/* Real-time Filler Word Alerts */}
        {(() => {
          const fillers = ['um', 'uh', 'like', 'so', 'actually', 'basically', 'literally', 'you know'];
          const counts: { [key: string]: number } = {};
          const cleanText = userSpeechInput.toLowerCase();
          const words = cleanText.split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
          
          fillers.forEach(filler => {
            if (filler.includes(' ')) {
              const regex = new RegExp(`\\b${filler}\\b`, 'g');
              const matches = cleanText.match(regex);
              if (matches) {
                counts[filler] = matches.length;
              }
            } else {
              const count = words.filter(w => w === filler).length;
              if (count > 0) {
                counts[filler] = count;
              }
            }
          });
          const totalFillerCount = Object.values(counts).reduce((a, b) => a + b, 0);

          if (totalFillerCount === 0) return null;
          return (
            <div className="flex flex-wrap items-center gap-1.5 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-800 font-medium">
              <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">warning</span>
              <span className="font-geist font-bold text-[11px] tracking-wide uppercase mr-1">Filler Alert:</span>
              {Object.entries(counts).map(([word, count]) => (
                <span key={word} className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-900 rounded-md font-bold text-[10px] uppercase">
                  "{word}" x{count}
                </span>
              ))}
            </div>
          );
        })()}

        {/* Quick STAR Phrase Helper Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            STAR Builders:
          </span>
          {quickStarStarters.map((starter, i) => (
            <button
              key={i}
              type="button"
              onClick={() =>
                setUserSpeechInput((prev) => (prev ? `${prev} ${starter}` : starter))
              }
              className="text-[11px] bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg px-2.5 py-1 transition-colors"
            >
              {starter.slice(0, 32)}...
            </button>
          ))}
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`px-4 py-2.5 rounded-xl font-geist text-xs font-bold shadow-xs flex items-center gap-2 transition-all ${
                isMicOn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                  : 'bg-slate-900 hover:bg-black text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isMicOn ? 'mic_off' : 'mic'}
              </span>
              <span>{isMicOn ? 'Stop Talking' : 'Start Talking (Mic)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCameraOn(!isCameraOn)}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCameraOn ? 'videocam_off' : 'videocam'}
              </span>
              <span>{isCameraOn ? 'Hide Camera' : 'Show Camera'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSendResponse()}
            disabled={!userSpeechInput.trim() || isEvaluating}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-[#06B6D4] hover:opacity-95 text-white rounded-xl font-geist text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 active:scale-98"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isEvaluating ? 'sync' : 'send'}
            </span>
            <span>{isEvaluating ? 'Evaluating Turn...' : 'Submit Answer (Evaluate)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
