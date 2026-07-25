import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PIPELINE_STEPS } from '../../data/mockData';
import { Terminal, Split, Search, Award, ShieldAlert, Scale, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export const HowPramaanThinks: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<number>(3);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Terminal': return Terminal;
      case 'Split': return Split;
      case 'Search': return Search;
      case 'Award': return Award;
      case 'ShieldAlert': return ShieldAlert;
      case 'Scale': return Scale;
      case 'CheckCircle2': return CheckCircle2;
      default: return Activity;
    }
  };

  const activeStep = PIPELINE_STEPS.find((s) => s.id === activeStepId) || PIPELINE_STEPS[2];

  return (
    <section className="py-28 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16 space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
          ARCHITECTURE & VERIFICATION LOGIC
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-editorial text-white">
          How PRAMAAN Thinks
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto text-sm">
          A multi-agent consensus pipeline operating within milliseconds of token generation.
        </p>
      </div>

      {/* Timeline Node Chain */}
      <div className="relative mb-16">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/[0.06] -translate-y-1/2 hidden md:block" />

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 relative z-10">
          {PIPELINE_STEPS.map((step) => {
            const Icon = getIcon(step.iconName);
            const isActive = step.id === activeStepId;
            const isPassed = step.id < activeStepId;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 relative group text-left ${
                  isActive
                    ? 'bg-[#111113] border-purple-500/60 shadow-[0_0_30px_rgba(124,58,237,0.25)] scale-105'
                    : isPassed
                    ? 'bg-zinc-900/60 border-purple-500/20 text-zinc-300'
                    : 'bg-[#111113]/40 border-white/[0.06] text-zinc-500 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : isPassed
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  Step 0{step.id}
                </span>
                <span
                  className={`text-xs font-medium mt-0.5 transition-colors ${
                    isActive ? 'text-white font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {step.name}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="timeline-active-glow"
                    className="absolute -bottom-2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#7C3AED]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Stage Inspector Card */}
      <div className="relative rounded-3xl bg-[#111113] border border-white/10 p-8 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
          >
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono text-xs">
                  Stage 0{activeStep.id} / 07
                </span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  {activeStep.sublabel}
                </span>
              </div>

              <h3 className="text-3xl font-serif-editorial text-white">
                {activeStep.label}
              </h3>

              <p className="text-zinc-300 text-sm leading-relaxed max-w-xl">
                {activeStep.description}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/[0.06] text-xs font-mono">
                  <span className="text-zinc-500 block text-[10px]">BENCHMARK PERFORMANCE</span>
                  <span className="text-purple-300 font-semibold">{activeStep.metrics}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/[0.06] text-xs font-mono">
                  <span className="text-zinc-500 block text-[10px]">AGENT ARCHITECTURE</span>
                  <span className="text-emerald-400 font-semibold">Async Parallel Workers</span>
                </div>
              </div>
            </div>

            {/* Interactive Stage Preview Illustration */}
            <div className="bg-[#09090B] p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-zinc-400 text-[11px]">
                <span>STAGE LOG STREAM</span>
                <span className="text-emerald-400 font-bold">STATUS: OK</span>
              </div>

              <div className="space-y-2 text-zinc-300 text-[11px]">
                <p className="text-purple-400">&gt; Initializing agent {activeStep.name}...</p>
                <p className="text-zinc-400">&gt; Target latency: 12ms</p>
                <p className="text-zinc-300">&gt; State: Executing dual-trust heuristic graph</p>
                <p className="text-emerald-400">&gt; Output checksum verified: 0x8F92A</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveStepId((prev) => (prev % 7) + 1)}
                  className="text-xs text-purple-300 hover:text-white transition-colors flex items-center gap-1 font-sans font-medium"
                >
                  Next Pipeline Step <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
