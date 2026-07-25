import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Activity } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { useVerificationStore } from "../../stores/verification.store";
import type { TimelineStage } from "../../types";

const STAGES: { id: TimelineStage; label: string; desc: string }[] = [
  { id: "response_detected", label: "Response Detected", desc: "Streaming AI response stream captured" },
  { id: "claim_extraction", label: "Claim Extraction", desc: "Parsing factual sentences from text" },
  { id: "searching", label: "Searching Index", desc: "Querying peer-reviewed academic web databases" },
  { id: "evidence_collection", label: "Evidence Collection", desc: "Cross-referencing domain credibility scores" },
  { id: "verification", label: "Verification", desc: "Computing confidence scores and trust metrics" },
  { id: "completed", label: "Verification Complete", desc: "Session trust score published" }
];

export const TimelineView: React.FC = () => {
  const { currentSession } = useVerificationStore();
  const currentStage = currentSession?.currentStage ?? "response_detected";

  const getStageIndex = (stageId: TimelineStage) =>
    STAGES.findIndex((s) => s.id === stageId);

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="space-y-4 select-none">
      <Card variant="glass" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-primary uppercase font-mono tracking-wider">
            Verification Pipeline Timeline
          </h3>
          <span className="text-[10px] font-mono text-accent flex items-center gap-1">
            <Activity className="w-3 h-3 animate-pulse" />
            Live Stream
          </span>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex || (idx === activeIndex && currentStage === "completed");
            const isCurrent = idx === activeIndex && currentStage !== "completed";

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative flex items-start gap-4 pl-8"
              >
                {/* Node indicator */}
                <div className="absolute left-1.5 top-0.5 -translate-x-1/2 z-10">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-status-success/20 text-status-success border border-status-success/40 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-accent text-white shadow-glow-accent flex items-center justify-center animate-pulse">
                      <Clock className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-muted/40" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-semibold ${
                        isCompleted
                          ? "text-primary"
                          : isCurrent
                          ? "text-accent"
                          : "text-primary-muted"
                      }`}
                    >
                      {stage.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-accent animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-primary-muted mt-0.5 leading-normal">
                    {stage.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
