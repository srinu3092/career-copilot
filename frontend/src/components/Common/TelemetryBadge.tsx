import React from 'react';
import { Zap, ShieldCheck, Cpu, Database } from 'lucide-react';

export interface TelemetryMeta {
  latencyMs?: number;
  executionMode?: 'live' | 'demo';
  cached?: boolean;
  model?: string;
  timestamp?: string;
}

interface TelemetryBadgeProps {
  meta?: TelemetryMeta;
  className?: string;
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({ meta, className = '' }) => {
  if (!meta) return null;

  const isDemo = meta.executionMode === 'demo';
  const isCached = Boolean(meta.cached);
  const latency = meta.latencyMs !== undefined ? `${meta.latencyMs}ms` : '<10ms';
  const model = meta.model || (isDemo ? 'Sandbox Demo' : 'Gemini 2.5');

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        isDemo
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : isCached
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
      } ${className}`}
      title="Production LLMOps Telemetry & Caching Indicator"
    >
      {/* Mode Indicator */}
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            isDemo ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`}
        />
        <span className="font-semibold">{isDemo ? 'Demo Mode' : 'Live AI'}</span>
      </div>

      <span className="text-slate-300">|</span>

      {/* Latency */}
      <div className="flex items-center gap-1 text-slate-600">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span>{latency}</span>
      </div>

      {/* Cache Status */}
      {isCached && (
        <>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-emerald-700">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>LRU Cache Hit</span>
          </div>
        </>
      )}

      <span className="text-slate-300">|</span>

      {/* Model Name */}
      <div className="flex items-center gap-1 text-slate-500">
        <Cpu className="w-3.5 h-3.5" />
        <span>{model}</span>
      </div>
    </div>
  );
};
