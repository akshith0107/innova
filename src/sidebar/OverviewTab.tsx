import React from 'react';
import { useVerificationStore } from '../stores/useVerificationStore';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Activity, HelpCircle, ShieldAlert, Target } from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const { overallTrustScore, scores, topics, activeClaims, activeSources } = useVerificationStore();

  const supportedCount = activeClaims.filter((c) => c.status === 'verified' || c.status === 'supported' as any).length;
  const contradictedCount = activeClaims.filter((c) => c.status === 'contradicted').length;
  const unsupportedCount = activeClaims.filter((c) => c.status === 'unsupported' as any || c.status === 'unverified' as any).length;

  return (
    <div className="space-y-5 text-white font-sans">
      {/* 5-Dimension Quality Score Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-[#111113] to-purple-950/40 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            OVERALL ANSWER QUALITY
          </span>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/40">
            PROMPT TYPE: {topics.promptType || 'FACTUAL_QUERY'}
          </span>
        </div>

        {/* Big Score Display */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-serif-editorial text-white tracking-tight">
              {scores.overallQuality || overallTrustScore}%
            </span>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest ml-2">
              COMPOSITE QUALITY SCORE
            </span>
          </div>
        </div>

        {/* 4 Grid Dimension Gauges */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-zinc-400 block uppercase">Fact Accuracy</span>
            <span className="text-sm font-bold text-emerald-400">{scores.factAccuracy || 100}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-zinc-400 block uppercase">Prompt Relevance</span>
            <span className="text-sm font-bold text-blue-400">{scores.relevance || 100}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-zinc-400 block uppercase">Answer Completeness</span>
            <span className="text-sm font-bold text-amber-400">{scores.completeness || 100}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-zinc-400 block uppercase">Hallucination Risk</span>
            <span className="text-sm font-bold text-rose-400">{scores.hallucinationRisk || 0}%</span>
          </div>
        </div>
      </div>

      {/* Topic Coverage Matrix Card */}
      {topics.missingTopics && topics.missingTopics.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Missing Information Alert</span>
          </div>
          <p className="text-xs text-zinc-300">
            The AI response left out key topics requested in your prompt:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {topics.missingTopics.map((topic, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-200 text-[11px] font-mono border border-rose-500/40">
                ⚠️ {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Claims Verdict Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-emerald-500/20 text-center space-y-1">
          <div className="flex justify-center text-emerald-400 mb-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold font-mono text-emerald-300">{supportedCount}</span>
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">Supported</span>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-rose-500/20 text-center space-y-1">
          <div className="flex justify-center text-rose-400 mb-0.5">
            <XCircle className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold font-mono text-rose-300">{contradictedCount}</span>
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">Contradicted</span>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-500/20 text-center space-y-1">
          <div className="flex justify-center text-zinc-400 mb-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold font-mono text-zinc-300">{unsupportedCount}</span>
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">Unsupported</span>
        </div>
      </div>
    </div>
  );
};
