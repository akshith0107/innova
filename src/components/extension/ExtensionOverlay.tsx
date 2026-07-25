import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Maximize2, Sparkles, ListCheck, BookOpen, Clock } from 'lucide-react';
import { MOCK_VERIFICATION_APPLES } from '../../data/mockData';
import { ExtensionOverview } from './ExtensionOverview';
import { ExtensionClaims } from './ExtensionClaims';
import { ExtensionSources } from './ExtensionSources';
import { ExtensionTimeline } from './ExtensionTimeline';

interface ExtensionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: () => void;
}

export const ExtensionOverlay: React.FC<ExtensionOverlayProps> = ({
  isOpen,
  onClose,
  onOpenReport,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'sources' | 'timeline'>('overview');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 450, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 450, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-4 right-4 bottom-4 w-full max-w-[420px] z-50 rounded-[32px] bg-[#111113]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-white font-sans"
        >
          {/* Header Bar */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#09090B]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wider font-mono uppercase flex items-center gap-2">
                  PRAMAAN UI
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] font-mono text-zinc-400">
                  Real-time ChatGPT Overlay
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenReport}
                className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-purple-500/40 transition-colors cursor-pointer"
                title="Open Full Editorial Report"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="px-5 py-3 border-b border-white/[0.06] bg-[#09090B]/30 flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-1 px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`pb-1 px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'claims'
                  ? 'border-purple-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListCheck className="w-3 h-3" />
              Claims
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`pb-1 px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sources'
                  ? 'border-purple-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              Sources
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-1 px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'border-purple-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              Timeline
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === 'overview' && (
              <ExtensionOverview data={MOCK_VERIFICATION_APPLES} />
            )}
            {activeTab === 'claims' && (
              <ExtensionClaims claims={MOCK_VERIFICATION_APPLES.claims} />
            )}
            {activeTab === 'sources' && (
              <ExtensionSources sources={MOCK_VERIFICATION_APPLES.sources} />
            )}
            {activeTab === 'timeline' && <ExtensionTimeline />}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-white/[0.08] bg-[#09090B] flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-500 text-[11px]">
              Verified by 4 Peer Repositories
            </span>
            <button
              onClick={onOpenReport}
              className="px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
            >
              Full Report →
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
