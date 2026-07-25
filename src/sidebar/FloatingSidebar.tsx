import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore, type SidebarTab } from '../stores/useSidebarStore';
import { useVerificationStore } from '../stores/useVerificationStore';
import { ShieldCheck, X, Sparkles, ListCheck, BookOpen, Clock, History as HistoryIcon, GripVertical } from 'lucide-react';
import { OverviewTab } from './OverviewTab';
import { ClaimsTab } from './ClaimsTab';
import { EvidenceTab } from './EvidenceTab';
import { TimelineTab } from './TimelineTab';
import { HistoryTab } from './HistoryTab';

export const FloatingSidebar: React.FC = () => {
  const { isOpen, activeTab, widthPx, toggleSidebar, setActiveTab, setWidthPx } = useSidebarStore();
  const { activeClaims } = useVerificationStore();
  const [isResizing, setIsResizing] = useState(false);

  // Keyboard shortcut listener (Alt + Shift + V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Handle Drag Resizing between 360px and 600px
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 360 && newWidth <= 640) {
        setWidthPx(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setWidthPx]);

  const verifiedCount = activeClaims ? activeClaims.filter((c) => c.status === 'verified').length : 0;
  const contradictedCount = activeClaims ? activeClaims.filter((c) => c.status === 'contradicted').length : 0;
  const claimsCount = activeClaims ? activeClaims.length : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 450, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 450, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ width: `${widthPx}px` }}
          className="fixed top-4 right-4 bottom-4 z-[99999] rounded-[32px] bg-[#09090B]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-white font-sans selection:bg-purple-600/30 selection:text-purple-200"
        >
          {/* Resize Handle on Left Border */}
          <div
            onMouseDown={() => setIsResizing(true)}
            className="absolute left-0 top-0 bottom-0 w-2 hover:w-3 bg-transparent hover:bg-purple-500/30 cursor-ew-resize transition-all z-10 flex items-center justify-center group"
          >
            <GripVertical className="w-3 h-3 text-zinc-600 group-hover:text-purple-400" />
          </div>

          {/* Header Bar */}
          <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between bg-[#111113]/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  PRAMAAN UI
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                    Live Verified
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  AI Real-Time Trust Layer (Alt+Shift+V)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="px-3 py-2 border-b border-white/[0.06] bg-[#09090B] flex items-center gap-1 text-xs font-mono overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Overview
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'claims'
                  ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <ListCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Claims</span>
              {claimsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 text-zinc-300">
                  {claimsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'evidence'
                  ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Evidence
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'timeline'
                  ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Timeline
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'history'
                  ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5 text-cyan-400" /> History
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'claims' && <ClaimsTab />}
            {activeTab === 'evidence' && <EvidenceTab />}
            {activeTab === 'timeline' && <TimelineTab />}
            {activeTab === 'history' && <HistoryTab />}
          </div>

          {/* Footer Action */}
          <div className="p-3.5 px-5 border-t border-white/[0.08] bg-[#111113] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
              <span className="text-emerald-400 font-semibold">{verifiedCount} Verified</span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">{contradictedCount} Contradicted</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[11px]">
              <span>Width: {widthPx}px</span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
