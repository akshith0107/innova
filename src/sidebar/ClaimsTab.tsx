import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVerificationStore } from '../stores/useVerificationStore';
import { useSidebarStore } from '../stores/useSidebarStore';
import { ChevronDown, ExternalLink, BookOpen, CheckCircle2, XCircle, HelpCircle, AlertTriangle, ShieldCheck, Hash } from 'lucide-react';
import type { Claim } from '../types/verification';

export const ClaimsTab: React.FC = () => {
  const { activeClaims } = useVerificationStore();
  const { openEvidenceDrawer } = useSidebarStore();
  
  // Sort Claims: Critical Contradictions -> False/Contradicted -> Partially Supported -> Unverified -> Supported LAST!
  const sortedClaims = [...activeClaims].sort((a, b) => {
    const getRank = (c: Claim) => {
      const norm = (c.status || '').toLowerCase();
      if (norm === 'contradicted' || norm === 'refuted' || norm === 'false') {
        return c.risk_level === 'CRITICAL' ? 0 : 1;
      }
      if (norm === 'partially_supported' || norm === 'mixed') return 2;
      if (norm === 'needs_review' || norm === 'analyzing' || norm === 'uncertain') return 3;
      return 4; // Supported claims LAST!
    };
    return getRank(a) - getRank(b);
  });

  const [expandedId, setExpandedId] = useState<string | null>(sortedClaims[0]?.id || null);

  const renderStatusBadge = (status: string, confidence: number, risk?: string) => {
    const norm = (status || '').toLowerCase();
    if (norm === 'contradicted' || norm === 'refuted' || norm === 'false') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/40 flex items-center gap-1 font-bold">
          <XCircle className="w-3 h-3 text-rose-400" /> CONTRADICTED {risk ? `[${risk}]` : ''} ({confidence}%)
        </span>
      );
    }
    if (norm === 'partially_supported' || norm === 'mixed') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" /> PARTIALLY SUPPORTED ({confidence}%)
        </span>
      );
    }
    if (norm === 'verified' || norm === 'supported' || norm === 'true') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SUPPORTED ({confidence}%)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-zinc-500/20 text-zinc-300 text-[10px] font-mono border border-zinc-500/40 flex items-center gap-1">
        <HelpCircle className="w-3 h-3 text-zinc-400" /> UNSUPPORTED ({confidence}%)
      </span>
    );
  };

  return (
    <div className="space-y-3 font-sans text-white">
      <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-400">
        <span>FALSIFICATION PRIORITY ORDER ({sortedClaims.length})</span>
        <span className="text-rose-400 font-bold">CONTRADICTIONS FIRST</span>
      </div>

      {sortedClaims.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#111113] border border-white/[0.06] text-xs font-mono text-zinc-500">
          No claims extracted yet. Waiting for LLM stream...
        </div>
      ) : (
        sortedClaims.map((claim) => {
          const isExpanded = expandedId === claim.id;
          const isContradicted = (claim.status || '').toLowerCase() === 'contradicted';

          return (
            <div
              key={claim.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isContradicted
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
                  : isExpanded
                  ? 'bg-zinc-900/90 border-purple-500/40'
                  : 'bg-[#111113] border-white/[0.06] hover:border-white/15'
              }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : claim.id)}
                className="w-full p-4 flex items-start justify-between text-left gap-3 group cursor-pointer"
              >
                <div className="space-y-2 flex-1">
                  <div>{renderStatusBadge(claim.status, claim.confidence, claim.risk_level)}</div>
                  <p className="text-xs font-medium text-white leading-relaxed pt-1">
                    "{claim.text}"
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 transition-transform duration-300 shrink-0 mt-1 ${
                    isExpanded ? 'rotate-180 text-purple-400' : 'group-hover:text-zinc-300'
                  }`}
                />
              </button>

              {/* Accordion Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4 border-t border-white/[0.06] space-y-3 pt-3 text-xs"
                  >
                    {/* Numeric Comparison Matrix Box */}
                    {claim.claimed_value && claim.verified_value && (
                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 space-y-2 font-mono text-[11px]">
                        <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5 text-amber-400" /> NUMERIC VERIFICATION MATRIX
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-center pt-1">
                          <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                            <span className="text-[9px] text-zinc-400 block">CLAIMED</span>
                            <span className="text-rose-300 font-bold">{claim.claimed_value}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                            <span className="text-[9px] text-zinc-400 block">VERIFIED</span>
                            <span className="text-emerald-300 font-bold">{claim.verified_value}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                            <span className="text-[9px] text-zinc-400 block">DIFFERENCE</span>
                            <span className="text-amber-300 font-bold">{claim.difference || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Disconfirming Correction Box */}
                    {claim.correction && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1 font-bold">
                          <ShieldCheck className="w-3 h-3 text-rose-400" /> FACTUAL CORRECTION
                        </span>
                        <p className="text-xs leading-relaxed font-medium">
                          {claim.correction}
                        </p>
                      </div>
                    )}

                    <p className="text-zinc-300 leading-relaxed text-[11px] bg-[#09090B] p-3 rounded-xl border border-white/[0.06]">
                      {claim.explanation || "Evaluated under Negative-Search-First falsification architecture."}
                    </p>

                    {claim.sources && claim.sources.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                          Authoritative Citation Repositories:
                        </span>
                        {claim.sources.map((src) => (
                          <div
                            key={src.id}
                            onClick={() => openEvidenceDrawer(claim)}
                            className="p-2.5 rounded-xl bg-[#09090B] border border-white/[0.06] flex items-center justify-between hover:border-purple-500/30 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-white text-[11px] font-medium">
                                {src.name}
                              </span>
                            </div>
                            <span className="text-purple-300 text-[10px] font-mono flex items-center gap-1 group-hover:text-purple-200">
                              Inspect Evidence <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
};
