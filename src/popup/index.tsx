import React from 'react';
import { createRoot } from 'react-dom/client';
import { Shield, Sparkles, Layers, Sliders, ExternalLink, Power } from 'lucide-react';
import { useSettingsStore } from '../stores/useSettingsStore';
import '../index.css';

const Popup = () => {
  const { isEnabled, setIsEnabled } = useSettingsStore();

  const handleOpenOptions = () => {
    if (chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  const handleToggleSidebar = () => {
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'TOGGLE_SIDEBAR', payload: {} });
      }
    });
  };

  return (
    <div className="w-80 p-5 bg-[#09090B] text-white border border-white/10 rounded-2xl shadow-2xl font-sans space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wider font-mono uppercase flex items-center gap-1.5">
              PRAMAAN
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">v2.4.0</span>
          </div>
        </div>

        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`p-2 rounded-full border transition-colors cursor-pointer ${
            isEnabled
              ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}
          title="Toggle Extension Hook"
        >
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Status */}
      <div className="p-4 rounded-2xl bg-[#111113] border border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">STATUS:</span>
          <span className={isEnabled ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
            {isEnabled ? 'ACTIVE ON ALL LLMS' : 'PAUSED'}
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          PRAMAAN automatically monitors ChatGPT, Gemini, Claude, Perplexity, Grok, DeepSeek, and Copilot in real time.
        </p>
      </div>

      {/* Action triggers */}
      <div className="space-y-2">
        <button
          onClick={handleToggleSidebar}
          className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          Toggle Floating Sidebar (Alt+Shift+V)
        </button>

        <button
          onClick={handleOpenOptions}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          Open Settings & Onboarding
        </button>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root') || document.body);
root.render(<Popup />);
