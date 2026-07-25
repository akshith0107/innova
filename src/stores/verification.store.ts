import { create } from "zustand";
import type { Claim, Evidence, PlatformType, VerificationSession } from "../types";
import { verifyService } from "../services/verify.service";

interface VerificationState {
  currentSession: VerificationSession | null;
  selectedClaim: Claim | null;
  activeEvidenceDrawer: Evidence | null;
  activePlatform: PlatformType;
  isVerifying: boolean;

  startSession: (platform: PlatformType, initialResponseText?: string) => void;
  addVerifiedClaim: (claim: Claim) => void;
  setStage: (stage: VerificationSession["currentStage"]) => void;
  selectClaim: (claim: Claim | null) => void;
  openEvidenceDrawer: (evidence: Evidence) => void;
  closeEvidenceDrawer: () => void;
  endSession: () => void;
}

export const useVerificationStore = create<VerificationState>((set, get) => ({
  currentSession: null,
  selectedClaim: null,
  activeEvidenceDrawer: null,
  activePlatform: "chatgpt",
  isVerifying: false,

  startSession: (platform: PlatformType, initialResponseText = "") => {
    const session = verifyService.createNewSession(platform, initialResponseText);
    set({
      currentSession: session,
      activePlatform: platform,
      isVerifying: true,
      selectedClaim: null,
      activeEvidenceDrawer: null
    });
  },

  addVerifiedClaim: (claim: Claim) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updatedClaims = [...currentSession.claims.filter((c) => c.id !== claim.id), claim];

    // Compute updated Trust Score based on claims
    const verifiedCount = updatedClaims.filter((c) => c.status === "verified").length;
    const contradictedCount = updatedClaims.filter((c) => c.status === "contradicted").length;
    const total = updatedClaims.length;

    let overallTrustScore = 100;
    if (total > 0) {
      const penalty = (contradictedCount * 40 + (total - verifiedCount - contradictedCount) * 10) / total;
      overallTrustScore = Math.max(0, Math.round(100 - penalty));
    }

    set({
      currentSession: {
        ...currentSession,
        claims: updatedClaims,
        overallTrustScore
      }
    });
  },

  setStage: (stage) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updatedTimeline = currentSession.timeline.map((event) => {
      if (event.stage === stage) {
        return { ...event, completed: true, timestamp: Date.now() };
      }
      return event;
    });

    set({
      currentSession: {
        ...currentSession,
        currentStage: stage,
        timeline: updatedTimeline,
        isStreaming: stage !== "completed"
      },
      isVerifying: stage !== "completed"
    });
  },

  selectClaim: (claim) => set({ selectedClaim: claim }),

  openEvidenceDrawer: (evidence) => set({ activeEvidenceDrawer: evidence }),

  closeEvidenceDrawer: () => set({ activeEvidenceDrawer: null }),

  endSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({
      currentSession: {
        ...currentSession,
        currentStage: "completed",
        isStreaming: false,
        endTime: Date.now()
      },
      isVerifying: false
    });
  }
}));
