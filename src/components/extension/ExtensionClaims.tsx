import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Claim } from '../../types/pramaan';
import { TrustBadge } from '../common/TrustBadge';
import { ChevronDown, ExternalLink, BookOpen } from 'lucide-react';

interface ExtensionClaimsProps {
  claims: Claim[];
  onSelectClaim?: (claim: Claim) => void;
}

export const ExtensionClaims: React.FC<ExtensionClaimsProps> = ({
  claims,
  onSelectClaim,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(claims[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-400">
        <span>EXTRACTED CLAIMS ({claims.length})</span>
        <span>REAL-TIME AUDIT</span>
      </div>

      {claims.map((claim) => {
        const isExpanded = expandedId === claim.id;

        return (
          <div
            key={claim.id}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              isExpanded
                ? 'bg-zinc-900/90 border-purple-500/40 shadow-lg'
                : 'bg-[#111113] border-white/[0.06] hover:border-white/15'
            }`}
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleExpand(claim.id)}
              className="w-full p-4 flex items-start justify-between text-left gap-3 group cursor-pointer"
            >
              <div className="space-y-2 flex-1">
                <TrustBadge status={claim.status} confidence={claim.confidence} />
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

            {/* Accordion Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4 border-t border-white/[0.06] space-y-3 pt-3 text-xs"
                >
                  <p className="text-zinc-300 leading-relaxed text-[11px] bg-[#09090B] p-3 rounded-xl border border-white/[0.06]">
                    {claim.explanation}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Cited Peer Sources:
                    </span>
                    {claim.sources.map((src) => (
                      <div
                        key={src.id}
                        onClick={() => onSelectClaim && onSelectClaim(claim)}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
