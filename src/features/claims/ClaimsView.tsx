import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Clock, ChevronRight, FileText, ExternalLink } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useVerificationStore } from "../../stores/verification.store";
import { confidenceToColour, formatRelativeTime } from "../../utils";

export const ClaimsView: React.FC = () => {
  const { currentSession, openEvidenceDrawer } = useVerificationStore();
  const claims = currentSession?.claims ?? [];
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  if (claims.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-32 border border-border space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 text-primary-muted flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-primary">No Claims Extracted Yet</h3>
        <p className="text-xs text-primary-muted max-w-xs mx-auto">
          Start a prompt or conversation on ChatGPT, Gemini, or Claude. Sentences will be verified in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none">
      {claims.map((claim) => {
        const isExpanded = expandedClaimId === claim.id;

        const statusIconMap = {
          verified: <CheckCircle2 className="w-4 h-4 text-status-success" />,
          contradicted: <AlertTriangle className="w-4 h-4 text-status-danger" />,
          unsupported: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          pending: <Clock className="w-4 h-4 text-status-warning" />,
          unverified: <Clock className="w-4 h-4 text-primary-muted" />
        };

        // Underline style: red for contradicted, orange for unsupported
        const claimTextUnderline = claim.status === 'contradicted'
          ? 'underline decoration-2 decoration-rose-500 underline-offset-4'
          : claim.status === 'unsupported'
          ? 'underline decoration-2 decoration-amber-500 underline-offset-4'
          : '';

        return (
          <Card key={claim.id} variant="glass" className="p-4 transition-all">
            <div
              onClick={() => setExpandedClaimId(isExpanded ? null : claim.id)}
              className="flex items-start justify-between gap-3 cursor-pointer select-none"
            >
              <div className="flex items-start gap-2.5 flex-1">
                <span className="shrink-0 mt-0.5">{statusIconMap[claim.status]}</span>
                <div>
                  <p className={`text-xs font-medium text-primary leading-snug ${claimTextUnderline}`}>{claim.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={claim.status === "verified" ? "success" : claim.status === "contradicted" ? "danger" : "warning"}>
                      {claim.status}
                    </Badge>
                    <span className="text-[10px] font-mono text-primary-muted">
                      {claim.confidence}% confidence
                    </span>
                    <span className="text-[10px] font-mono text-primary-muted">
                      • {formatRelativeTime(claim.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-4 h-4 text-primary-muted" />
              </motion.div>
            </div>

            {/* Expandable Details & Evidence Preview */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 pt-3 border-t border-border/60 text-xs space-y-3"
                >
                  <p className="text-primary-muted text-[11px] leading-relaxed">
                    Source text: &quot;{claim.extractedFromSentence}&quot;
                  </p>

                  {claim.evidence && (
                    <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-primary text-xs">
                          {claim.evidence.supportingSources.length} Supporting Sources
                        </p>
                        <p className="text-[11px] text-primary-muted">
                          Credibility Score: {claim.evidence.credibilityScore}%
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        rightIcon={<ExternalLink className="w-3 h-3" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (claim.evidence) openEvidenceDrawer(claim.evidence);
                        }}
                      >
                        Inspect Evidence
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
};
