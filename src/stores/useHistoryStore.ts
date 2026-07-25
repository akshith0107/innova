import { create } from 'zustand';
import type { VerificationResult } from '../types/verification';
import { MOCK_VERIFICATION_APPLES, PRESET_WORKSPACE_SAMPLES } from '../data/mockData';

interface HistoryStoreState {
  historyItems: VerificationResult[];
  searchQuery: string;
  selectedLLMFilter: string;

  // Actions
  addHistoryItem: (item: VerificationResult) => void;
  clearHistory: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedLLMFilter: (provider: string) => void;
}

export const useHistoryStore = create<HistoryStoreState>((set) => ({
  historyItems: PRESET_WORKSPACE_SAMPLES,
  searchQuery: '',
  selectedLLMFilter: 'all',

  addHistoryItem: (item) =>
    set((state) => ({
      historyItems: [item, ...state.historyItems.filter((i) => i.id !== item.id)]
    })),
  clearHistory: () => set({ historyItems: [] }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedLLMFilter: (selectedLLMFilter) => set({ selectedLLMFilter }),
}));
