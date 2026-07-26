import React from 'react';
import { Shield, Sparkles, Layers, Sliders, History, FileText } from 'lucide-react';
import type { ViewMode } from '../../types/pramaan';
import { MagneticButton } from './MagneticButton';
import { AddExtensionButton } from './AddExtensionButton';

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  isExtensionOpen: boolean;
  onToggleExtension: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  isExtensionOpen,
  onToggleExtension,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3 rounded-full bg-[#111113]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
        {/* Logo */}
        <div
          onClick={() => onSelectView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/30 to-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(124,58,237,0.3)] group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-purple-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-widest uppercase text-white font-mono flex items-center gap-1.5">
              PRAMAAN
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            </span>
            <span className="text-[10px] text-zinc-500 tracking-wider font-mono">
              THE AI TRUST LAYER
            </span>
          </div>
        </div>

        {/* View mode switcher */}
        <nav className="hidden md:flex items-center gap-1 bg-[#09090B]/60 p-1 rounded-full border border-white/[0.06]">
          <button
            onClick={() => onSelectView('landing')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              currentView === 'landing'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectView('workspace')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'workspace'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Verification Lab
          </button>
          <button
            onClick={() => onSelectView('report')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'report'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Report
          </button>
          <button
            onClick={() => onSelectView('history')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'history'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit History
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Extension overlay trigger */}
          <button
            onClick={onToggleExtension}
            className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
              isExtensionOpen
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-200 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                : 'bg-zinc-900 border-white/10 text-zinc-300 hover:border-white/20'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Extension Drawer</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Settings button */}
          <button
            onClick={() => onSelectView('settings')}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            title="Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <AddExtensionButton
            size="sm"
            variant="primary"
            className="hidden sm:inline-flex"
          />
        </div>
      </div>
    </header>
  );
};
