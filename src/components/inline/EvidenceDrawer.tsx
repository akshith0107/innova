import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ExternalLink, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { useSidebarStore } from '../../stores/useSidebarStore';
import { TrustBadge } from '../common/TrustBadge';

export const EvidenceDrawer: React.FC = () => {
  const { isDrawerOpen, selectedClaimForDrawer, closeEvidenceDrawer } = useSidebarStore();

  if (!selectedClaimForDrawer) return null;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex justify-end font-sans text-white"
          onClick={closeEvidenceDrawer}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[#111113] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl space-y-6"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-300">
                  EVIDENCE CITATION DRAWER
                </span>
              </div>
              <button
                onClick={closeEvidenceDrawer}
                className="p-2 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Claim Content Body */}
            <div className="space-y-6 flex-1">
              <div className="space-y-3">
                <TrustBadge
                  status={selectedClaimForDrawer.status}
                  confidence={selectedClaimForDrawer.confidence}
                />
                <h3 className="text-xl font-serif-editorial text-white leading-snug">
                  "{selectedClaimForDrawer.text}"
                </h3>
              </div>

              {/* Justification & Scientific Explanation */}
              <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block font-semibold">
                  ANALYSIS & PROOF EXPLANATION:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  {selectedClaimForDrawer.explanation}
                </p>
              </div>

              {/* Contradiction Details if any */}
              {selectedClaimForDrawer.contradictionDetails && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <span className="text-[10px] font-mono text-rose-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    CONTRADICTION ANALYSIS:
                  </span>
                  <p className="text-xs text-rose-200 leading-relaxed">
                    {selectedClaimForDrawer.contradictionDetails}
                  </p>
                </div>
              )}

              {/* Peer-Reviewed Sources */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
                  Cited Peer Repositories ({selectedClaimForDrawer.sources.length}):
                </span>

                {selectedClaimForDrawer.sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.06] space-y-2 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                        {src.name}
                      </span>
                      <TrustBadge credibilityBadge={src.credibilityBadge} />
                    </div>

                    <h4 className="text-xs text-zinc-200 font-medium">{src.title}</h4>
                    <p className="text-[11px] text-zinc-400 italic line-clamp-2">
                      "{src.snippet}"
                    </p>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Published: {src.date}</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        {src.domain} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Cryptographically Verified</span>
              <button
                onClick={closeEvidenceDrawer}
                className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-medium transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
