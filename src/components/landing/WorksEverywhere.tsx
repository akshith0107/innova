import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LLMProvider } from '../../types/pramaan';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';

export const WorksEverywhere: React.FC = () => {
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('chatgpt');

  const providers: { id: LLMProvider; name: string; tag: string; bgGradient: string }[] = [
    { id: 'chatgpt', name: 'ChatGPT', tag: 'OpenAI GPT-4o', bgGradient: 'from-emerald-950/30 to-zinc-950' },
    { id: 'claude', name: 'Claude', tag: 'Anthropic Claude 3.5 Sonnet', bgGradient: 'from-amber-950/30 to-zinc-950' },
    { id: 'gemini', name: 'Gemini', tag: 'Google Gemini 1.5 Pro', bgGradient: 'from-blue-950/30 to-zinc-950' },
    { id: 'perplexity', name: 'Perplexity', tag: 'Perplexity Pro Engine', bgGradient: 'from-cyan-950/30 to-zinc-950' },
    { id: 'grok', name: 'Grok', tag: 'xAI Grok-2', bgGradient: 'from-purple-950/30 to-zinc-950' },
    { id: 'deepseek', name: 'DeepSeek', tag: 'DeepSeek R1 Reasoner', bgGradient: 'from-indigo-950/30 to-zinc-950' },
    { id: 'copilot', name: 'Copilot', tag: 'Microsoft Copilot Pro', bgGradient: 'from-sky-950/30 to-zinc-950' },
  ];

  const activeProvider = providers.find((p) => p.id === selectedLLM) || providers[0];

  return (
    <section className="py-28 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-14 space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
          UNIVERSAL EXTENSION LAYER
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-editorial text-white">
          Works Everywhere
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto text-sm">
          PRAMAAN attaches seamlessly to every major LLM Web UI with zero configuration or API key setup required.
        </p>
      </div>

      {/* Provider Switcher Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
        {providers.map((p) => {
          const isActive = p.id === selectedLLM;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedLLM(p.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                  : 'bg-[#111113] text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Floating Browser Mockup Frame */}
      <div className="relative rounded-3xl bg-[#111113] border border-white/10 p-2 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] bg-[#09090B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <div className="ml-4 px-3 py-1 rounded-md bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-400 flex items-center gap-2">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>https://{selectedLLM}.com/chat</span>
            </div>
          </div>
          <span className="text-xs font-mono text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            PRAMAAN Extension Injected
          </span>
        </div>

        {/* Content Container simulating LLM interface */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProvider.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className={`p-8 sm:p-12 min-h-[380px] bg-gradient-to-br ${activeProvider.bgGradient} relative flex flex-col justify-between`}
          >
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
                {activeProvider.tag} Output Stream
              </span>
              <p className="text-xl sm:text-2xl font-sans text-zinc-100 font-light leading-relaxed">
                "Global atmospheric carbon capture facilities increased operational efficiency by 34% in 2025, according to IPCC synthetic fuel synthesis reports."
              </p>
            </div>

            {/* Floating PRAMAAN Trust Badge in LLM Corner */}
            <div className="mt-8 self-end p-4 rounded-2xl bg-[#111113]/90 backdrop-blur-md border border-purple-500/40 shadow-2xl flex items-center gap-4 max-w-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between font-mono text-zinc-300">
                  <span className="font-semibold text-white">PRAMAAN VERIFIED</span>
                  <span className="text-emerald-400 font-bold">97% SCORE</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  1 Claim Cross-Referenced against IPCC Tier 1 Data
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
