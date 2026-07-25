import React from "react";
import { Drawer } from "../../components/ui/Drawer";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ExternalLink, ShieldCheck, BookOpen, AlertTriangle } from "lucide-react";
import { useVerificationStore } from "../../stores/verification.store";

export const EvidenceDrawer: React.FC = () => {
  const { activeEvidenceDrawer, closeEvidenceDrawer } = useVerificationStore();

  if (!activeEvidenceDrawer) return null;

  return (
    <Drawer
      isOpen={Boolean(activeEvidenceDrawer)}
      onClose={closeEvidenceDrawer}
      title="Evidence Deep Dive"
      side="bottom"
    >
      <div className="space-y-4 pb-4 select-none">
        {/* Editorial Summary */}
        <div className="p-4 rounded-24 bg-surface-elevated border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-primary">Evidence Synthesis</span>
          </div>
          <p className="text-xs text-primary-muted leading-relaxed">
            {activeEvidenceDrawer.summary}
          </p>
        </div>

        {/* Supporting Sources Section */}
        {activeEvidenceDrawer.supportingSources.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-status-success" />
              <h4 className="text-xs font-semibold text-primary">Supporting Sources</h4>
            </div>
            {activeEvidenceDrawer.supportingSources.map((src) => (
              <div key={src.id} className="p-3.5 rounded-2xl bg-surface border border-border space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-primary leading-tight">{src.title}</h5>
                    <p className="text-[10px] font-mono text-primary-muted mt-0.5">{src.domain}</p>
                  </div>
                  <Badge variant="success" size="sm">
                    {src.credibilityScore}% Trust
                  </Badge>
                </div>
                <p className="text-xs text-primary-muted line-clamp-2">{src.snippet}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-primary-muted">
                    Published: {src.publishedDate || "Recent"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<ExternalLink className="w-3 h-3" />}
                    onClick={() => window.open(src.url, "_blank")}
                  >
                    Open Source
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contradicting Sources Section */}
        {activeEvidenceDrawer.contradictingSources.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-danger" />
              <h4 className="text-xs font-semibold text-primary">Contradicting Sources</h4>
            </div>
            {activeEvidenceDrawer.contradictingSources.map((src) => (
              <div key={src.id} className="p-3.5 rounded-2xl bg-surface border border-status-danger/30 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-primary leading-tight">{src.title}</h5>
                    <p className="text-[10px] font-mono text-primary-muted mt-0.5">{src.domain}</p>
                  </div>
                  <Badge variant="danger" size="sm">
                    {src.credibilityScore}% Trust
                  </Badge>
                </div>
                <p className="text-xs text-primary-muted line-clamp-2">{src.snippet}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-primary-muted">
                    Published: {src.publishedDate || "Recent"}
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    rightIcon={<ExternalLink className="w-3 h-3" />}
                    onClick={() => window.open(src.url, "_blank")}
                  >
                    Open Source
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};
