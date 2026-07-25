import React, { useState } from 'react';
import type { VerificationResult } from '../../types/pramaan';
import { PRESET_WORKSPACE_SAMPLES } from '../../data/mockData';
import { Filter, FileText, Calendar } from 'lucide-react';

interface VerificationHistoryProps {
  onSelectReport: (result: VerificationResult) => void;
}

export const VerificationHistory: React.FC<VerificationHistoryProps> = ({ onSelectReport }) => {
  const [filterLLM, setFilterLLM] = useState<string>('all');

  const historyItems = PRESET_WORKSPACE_SAMPLES;

  const filteredItems = filterLLM === 'all'
    ? historyItems
    : historyItems.filter((item) => item.llmProvider === filterLLM);

  return (
    <section className="pt-32 pb-28 px-6 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400 block mb-1">
            AUDIT TRAIL & LOGS
          </span>
          <h2 className="text-4xl font-serif-editorial text-white">
            Verification History
          </h2>
        </div>

        {/* LLM Filter dropdown */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-400">Filter LLM:</span>
          <select
            value={filterLLM}
            onChange={(e) => setFilterLLM(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-purple-300 focus:outline-none"
          >
            <option value="all">All LLM Targets</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectReport(item)}
            className="p-6 rounded-2xl bg-[#111113] border border-white/[0.06] hover:border-purple-500/40 transition-all duration-300 flex flex-wrap items-center justify-between gap-6 cursor-pointer group shadow-lg"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 border border-white/10 uppercase text-zinc-300">
                  {item.llmProvider}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  2026-07-25
                </span>
              </div>

              <h3 className="text-lg font-medium text-white group-hover:text-purple-300 transition-colors">
                "{item.query}"
              </h3>

              <p className="text-xs text-zinc-400 line-clamp-1 italic">
                {item.finalVerdict}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right font-mono">
                <span className="text-3xl font-serif-editorial text-purple-300 font-bold">
                  {item.overallTrustScore}%
                </span>
                <span className="text-[10px] text-zinc-500 block uppercase">Trust Score</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 group-hover:border-purple-500/50 text-zinc-400 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
