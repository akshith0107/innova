import React from 'react';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useVerificationStore } from '../stores/useVerificationStore';
import { useSidebarStore } from '../stores/useSidebarStore';
import { Search, Download, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export const HistoryTab: React.FC = () => {
  const { historyItems, searchQuery, setSearchQuery, selectedLLMFilter, setSelectedLLMFilter } =
    useHistoryStore();
  const { setActiveResult } = useVerificationStore();
  const { setActiveTab } = useSidebarStore();

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch = item.query.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedLLMFilter === 'all' || item.llmProvider === selectedLLMFilter;
    return matchesSearch && matchesFilter;
  });

  const handleExportJSON = (item: any) => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(item, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `PRAMAAN_AUDIT_${item.id}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="space-y-4 font-sans text-white">
      {/* Search & Filter Header */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past verification logs..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#111113] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>FILTER ENGINE:</span>
          <select
            value={selectedLLMFilter}
            onChange={(e) => setSelectedLLMFilter(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-purple-300 focus:outline-none"
          >
            <option value="all">All Engines</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setActiveResult(item);
              setActiveTab('overview');
            }}
            className="p-4 rounded-2xl bg-[#111113] border border-white/[0.06] hover:border-purple-500/40 transition-all space-y-2 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="uppercase text-zinc-300 px-2 py-0.5 rounded bg-zinc-900 border border-white/10">
                {item.llmProvider}
              </span>
              <span className="text-purple-300 font-bold font-mono">{item.overallTrustScore}% SCORE</span>
            </div>

            <h4 className="text-xs font-medium text-white group-hover:text-purple-300 transition-colors">
              "{item.query}"
            </h4>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-500">2026-07-25</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportJSON(item);
                }}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-2.5 h-2.5" /> Export JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
