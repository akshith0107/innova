import { create } from 'zustand';
import type { Claim, Source, VerificationResult } from '../types/verification';

export interface ScoreDimensions {
  overallQuality: number;
  factAccuracy: number;
  relevance: number;
  completeness: number;
  hallucinationRisk: number;
}

export interface TopicMatrix {
  promptType: string;
  expectedTopics: string[];
  coveredTopics: string[];
  missingTopics: string[];
}

interface VerificationStoreState {
  isVerifying: boolean;
  overallTrustScore: number;
  scores: ScoreDimensions;
  topics: TopicMatrix;
  activeClaims: Claim[];
  activeSources: Source[];
  activeQuery: string;
  activeResult: VerificationResult | null;
  
  // Actions
  setVerifying: (status: boolean) => void;
  setTrustScore: (score: number) => void;
  setScoreDimensions: (scores: Partial<ScoreDimensions>) => void;
  setTopicMatrix: (topics: Partial<TopicMatrix>) => void;
  setActiveClaims: (claims: Claim[]) => void;
  addClaim: (claim: Claim) => void;
  updateClaimStatus: (id: string, status: Claim['status'], confidence: number, explanation: string, sources: Source[]) => void;
  setActiveQuery: (query: string) => void;
  setActiveResult: (result: VerificationResult | null) => void;
  resetStream: () => void;
}

export const useVerificationStore = create<VerificationStoreState>((set) => ({
  isVerifying: false,
  overallTrustScore: 100,
  scores: {
    overallQuality: 100,
    factAccuracy: 100,
    relevance: 100,
    completeness: 100,
    hallucinationRisk: 0
  },
  topics: {
    promptType: 'FACTUAL_QUERY',
    expectedTopics: [],
    coveredTopics: [],
    missingTopics: []
  },
  activeClaims: [],
  activeSources: [],
  activeQuery: '',
  activeResult: null,

  setVerifying: (status) => set({ isVerifying: status }),
  setTrustScore: (score) => set({ overallTrustScore: score }),
  setScoreDimensions: (newScores) =>
    set((state) => ({ scores: { ...state.scores, ...newScores } })),
  setTopicMatrix: (newTopics) =>
    set((state) => ({ topics: { ...state.topics, ...newTopics } })),
  setActiveClaims: (claims) => set({ activeClaims: claims }),
  addClaim: (claim) =>
    set((state) => ({ activeClaims: [...state.activeClaims, claim] })),
  updateClaimStatus: (id, status, confidence, explanation, sources) =>
    set((state) => ({
      activeClaims: state.activeClaims.map((c) =>
        c.id === id
          ? { ...c, status, confidence, explanation, sources }
          : c
      ),
      activeSources: [
        ...state.activeSources,
        ...sources.filter((s) => !state.activeSources.some((existing) => existing.id === s.id))
      ]
    })),
  setActiveQuery: (query) => set({ activeQuery: query }),
  setActiveResult: (result) => set({ activeResult: result }),
  resetStream: () =>
    set({
      isVerifying: false,
      overallTrustScore: 100,
      scores: {
        overallQuality: 100,
        factAccuracy: 100,
        relevance: 100,
        completeness: 100,
        hallucinationRisk: 0
      },
      topics: {
        promptType: 'FACTUAL_QUERY',
        expectedTopics: [],
        coveredTopics: [],
        missingTopics: []
      },
      activeClaims: [],
      activeSources: [],
      activeQuery: '',
      activeResult: null
    })
}));
