import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

export const ExtensionTimeline: React.FC = () => {
  const stages = [
    { name: 'Response Captured', time: '0.2ms', status: 'completed' },
    { name: 'Claim Extraction', time: '1.4ms', status: 'completed' },
    { name: 'Searching', time: '8.2ms', status: 'completed' },
    { name: 'Evidence Cross-Ref', time: '12.1ms', status: 'completed' },
    { name: 'AI Debate', time: '18.4ms', status: 'completed' },
    { name: 'Judge', time: '22.0ms', status: 'completed' },
    { name: 'Verified', time: '24.2ms', status: 'completed' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-400">
        <span>EXECUTION TIMELINE</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <Zap className="w-3 h-3" /> 24.2ms Total Latency
        </span>
      </div>

      <div className="p-5 rounded-3xl bg-[#111113] border border-white/[0.06] space-y-4">
        {stages.map((stage, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="flex-1 flex items-center justify-between border-b border-white/[0.04] pb-2 text-xs">
              <span className="font-medium text-zinc-200">{stage.name}</span>
              <span className="font-mono text-[11px] text-zinc-500">{stage.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
