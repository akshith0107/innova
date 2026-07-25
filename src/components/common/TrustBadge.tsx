import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles } from 'lucide-react';
import type { ClaimStatus } from '../../types/pramaan';

interface TrustBadgeProps {
  status?: ClaimStatus;
  credibilityBadge?: 'High' | 'Medium' | 'Low';
  confidence?: number;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  status,
  credibilityBadge,
  confidence,
}) => {
  if (status) {
    const configMap = {
      verified: {
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/30',
        text: 'text-emerald-300',
        icon: CheckCircle2,
        label: 'Verified',
      },
      needs_review: {
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/30',
        text: 'text-amber-300',
        icon: AlertTriangle,
        label: 'Needs Context',
      },
      contradicted: {
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/30',
        text: 'text-rose-300',
        icon: XCircle,
        label: 'Contradicted',
      },
      analyzing: {
        bg: 'bg-purple-950/40',
        border: 'border-purple-500/30',
        text: 'text-purple-300',
        icon: Sparkles,
        label: 'Analyzing',
      },
    };

    const config = configMap[status] || configMap.verified;
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium tracking-wide uppercase ${config.bg} ${config.border} ${config.text}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
        {confidence !== undefined && (
          <span className="opacity-75 font-mono ml-0.5">{confidence}%</span>
        )}
      </div>
    );
  }

  if (credibilityBadge) {
    const badgeConfig = {
      High: 'bg-purple-950/40 border-purple-500/30 text-purple-300',
      Medium: 'bg-zinc-900 border-zinc-700 text-zinc-300',
      Low: 'bg-zinc-900/60 border-zinc-800 text-zinc-400',
    }[credibilityBadge];

    return (
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-mono tracking-wider ${badgeConfig}`}
      >
        <ShieldCheck className="w-3 h-3 opacity-80" />
        <span>{credibilityBadge} Trust</span>
      </div>
    );
  }

  return null;
};
