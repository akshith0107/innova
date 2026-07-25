import React from 'react';
import { useVerificationStore } from '../stores/useVerificationStore';
import { TrustBadge } from '../components/common/TrustBadge';
import { ExternalLink, Newspaper } from 'lucide-react';

export const EvidenceTab: React.FC = () => {
  const { activeSources } = useVerificationStore();

  return (
    <div className="space-y-3 text-white font-sans">
      <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-400">
        <span>PEER SOURCES ({activeSources.length})</span>
        <span>INDEXED GRAPH</span>
      </div>

      {activeSources.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#111113] border border-white/[0.06] text-xs font-mono text-zinc-500">
          No peer sources index matched yet.
        </div>
      ) : (
        activeSources.map((source) => (
          <div
            key={source.id}
            className="p-4 rounded-2xl bg-[#111113] border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300 space-y-3 group"
          >
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

            <div className="space-y-1">
              <h5 className="text-xs font-medium text-zinc-200 leading-snug">
                {source.title}
              </h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed italic line-clamp-2">
                "{source.snippet}"
              </p>
            </div>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Published: {source.date}</span>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300"
              >
                View Publication <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
