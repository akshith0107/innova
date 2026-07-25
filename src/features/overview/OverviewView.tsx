import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useVerificationStore } from "../../stores/verification.store";
import { confidenceToColour } from "../../utils";

export const OverviewView: React.FC = () => {
  const { currentSession, isVerifying } = useVerificationStore();

  const trustScore = currentSession?.overallTrustScore ?? 94;
  const claims = currentSession?.claims ?? [];

  const verifiedCount = claims.filter((c) => c.status === "verified").length;
  const pendingCount = claims.filter((c) => c.status === "pending").length;
  const contradictedCount = claims.filter((c) => c.status === "contradicted").length;

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.floor(easeProgress * trustScore));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [trustScore]);

  const scoreMeta = confidenceToColour(trustScore);

  return (
    <div className="space-y-5 select-none">
      {/* Editorial Header Hero */}
      <div className="relative p-6 rounded-32 bg-gradient-to-br from-surface to-surface-elevated border border-border shadow-glass overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <ShieldCheck className="w-32 h-32 text-accent" />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="accent" size="sm" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Live Trust Score
              </Badge>
              {isVerifying && (
                <span className="text-[11px] font-mono text-status-warning animate-pulse">
                  ● Verifying Response...
                </span>
              )}
            </div>
            <h2 className="text-xs uppercase font-mono tracking-widest text-primary-muted">
              AI Fact Verification Score
            </h2>
          </div>

          <span
            className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full border"
            style={{ borderColor: `${scoreMeta.hex}40`, color: scoreMeta.hex, backgroundColor: `${scoreMeta.hex}15` }}
          >
            {scoreMeta.label}
          </span>
        </div>

        {/* Large Editorial Score Display */}
        <div className="mt-6 mb-2 flex items-baseline gap-2">
          <span className="text-6xl font-extrabold tracking-tight text-primary font-sans">
            {animatedScore}
          </span>
          <span className="text-2xl font-semibold text-primary-muted">/100</span>
        </div>

        <p className="text-xs text-primary-muted max-w-xs leading-relaxed">
          Real-time cross-platform verification against indexed academic and peer-reviewed sources.
        </p>
      </div>

      {/* Stats Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="solid" className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-status-success mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase text-primary-muted">Verified</span>
          </div>
          <span className="text-2xl font-bold text-primary">{verifiedCount}</span>
        </Card>

        <Card variant="solid" className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-status-warning mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase text-primary-muted">Pending</span>
          </div>
          <span className="text-2xl font-bold text-primary">{pendingCount}</span>
        </Card>

        <Card variant="solid" className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-status-danger mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase text-primary-muted">Contradicted</span>
          </div>
          <span className="text-2xl font-bold text-primary">{contradictedCount}</span>
        </Card>
      </div>

      {/* Recent Activity Highlight */}
      <Card variant="bordered" className="p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-primary">Active Response Pipeline</span>
          <span className="font-mono text-primary-muted text-[11px]">
            {claims.length} claims detected
          </span>
        </div>
        <p className="text-xs text-primary-muted">
          Sentences are parsed incrementally into factual claims and validated against trusted sources.
        </p>
      </Card>
    </div>
  );
};
