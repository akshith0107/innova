import React from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ExternalLink, BookOpen, Layers } from "lucide-react";
import { useVerificationStore } from "../../stores/verification.store";

export const EvidenceView: React.FC = () => {
  const { currentSession, openEvidenceDrawer } = useVerificationStore();
  const claims = currentSession?.claims ?? [];
  const claimsWithEvidence = claims.filter((c) => c.evidence !== undefined);

  if (claimsWithEvidence.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-32 border border-border space-y-3 select-none">
        <div className="w-12 h-12 rounded-2xl bg-white/5 text-primary-muted flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-primary">No Evidence Collected Yet</h3>
        <p className="text-xs text-primary-muted max-w-xs mx-auto">
          Once claims are extracted from streamed AI responses, indexed supporting and contradicting sources will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none">
      {claimsWithEvidence.map((claim) => {
        const ev = claim.evidence!;
        return (
          <Card key={claim.id} variant="glass" className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-primary line-clamp-1 flex-1">
                {claim.text}
              </span>
              <Badge variant={claim.status === "verified" ? "success" : "danger"} size="sm">
                {ev.credibilityScore}% Score
              </Badge>
            </div>

            <p className="text-xs text-primary-muted leading-relaxed line-clamp-2">
              {ev.summary}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-[10px] font-mono text-primary-muted flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-accent" />
                {ev.supportingSources.length} Supporting Sources
              </span>
              <Button
                size="sm"
                variant="secondary"
                rightIcon={<ExternalLink className="w-3 h-3" />}
                onClick={() => openEvidenceDrawer(ev)}
              >
                Inspect Sources
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
