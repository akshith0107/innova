import React, { useEffect, useState } from 'react';
import type { VerificationResult } from '../../types/pramaan';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface ExtensionOverviewProps {
  data: VerificationResult;
}

export const ExtensionOverview: React.FC<ExtensionOverviewProps> = ({ data }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = data.overallTrustScore;
    const duration = 1200; // ms
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [data.overallTrustScore]);

  return (
    <div className="space-y-6">
      {/* Editorial Trust Score Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-[#111113] to-purple-950/40 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            OVERALL TRUST SCORE
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
            HIGH CONFIDENCE
          </span>
        </div>

        {/* Large Editorial Score Count-up */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-serif-editorial text-white tracking-tight">
              {animatedScore}%
            </span>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-2">
              VERIFIED ACCURACY
            </span>
          </div>

          {/* Minimal Sparkline SVG */}
          <div className="w-24 h-10 flex items-center">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path
                d="M 0 30 Q 20 25, 40 15 T 80 10 T 100 5"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2"
              />
              <path
                d="M 0 30 Q 20 25, 40 15 T 80 10 T 100 5 L 100 40 L 0 40 Z"
                fill="url(#sparklineGlow)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="sparklineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-3">
          {data.finalVerdict}
        </p>
      </div>

      {/* Claims Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/20 text-center space-y-1">
          <div className="flex justify-center text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold font-mono text-emerald-300">
            {data.verifiedCount}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">
            Verified
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/20 text-center space-y-1">
          <div className="flex justify-center text-amber-400 mb-1">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold font-mono text-amber-300">
            {data.needsReviewCount}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">
            Review
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-rose-500/20 text-center space-y-1">
          <div className="flex justify-center text-rose-400 mb-1">
            <XCircle className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold font-mono text-rose-300">
            {data.contradictedCount}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">
            Refuted
          </span>
        </div>
      </div>

      {/* Target LLM Indicator */}
      <div className="p-4 rounded-2xl bg-[#111113] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
        <span>ACTIVE SYSTEM HOOK</span>
        <span className="text-white uppercase font-semibold">
          {data.llmProvider} Web UI
        </span>
      </div>
    </div>
  );
};
