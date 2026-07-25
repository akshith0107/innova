import React from 'react';
import type { Source } from '../../types/pramaan';
import { TrustBadge } from '../common/TrustBadge';
import { ExternalLink, Newspaper } from 'lucide-react';

interface ExtensionSourcesProps {
  sources: Source[];
}

export const ExtensionSources: React.FC<ExtensionSourcesProps> = ({ sources }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-400">
        <span>PRIMARY SOURCES ({sources.length})</span>
        <span>INDEXED GRAPH</span>
      </div>

      {sources.map((source) => (
        <div
          key={source.id}
          className="p-4 rounded-2xl bg-[#111113] border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300 space-y-3 group"
        >
          {/* Top header: Source Logo / Domain & Credibility Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-purple-400 font-mono text-xs">
                <Newspaper className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {source.name}
                </h4>
                <span className="text-[10px] font-mono text-zinc-500">{source.domain}</span>
              </div>
            </div>

            <TrustBadge credibilityBadge={source.credibilityBadge} />
          </div>

          {/* Source Title & Snippet */}
          <div className="space-y-1">
            <h5 className="text-xs font-medium text-zinc-200 leading-snug">
              {source.title}
            </h5>
            <p className="text-[11px] text-zinc-400 leading-relaxed italic line-clamp-2">
              "{source.snippet}"
            </p>
          </div>

          {/* Footer date & external link */}
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Published: {source.date}</span>
            <span className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300">
              View Publication <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
