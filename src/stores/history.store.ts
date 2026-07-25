import { create } from "zustand";
import type { HistoryFilter, HistoryItem } from "../types";
import { historyService } from "../services/history.service";

interface HistoryState {
  items: HistoryItem[];
  filter: HistoryFilter;
  isLoading: boolean;
  fetchHistory: (filter?: HistoryFilter) => Promise<void>;
  addItem: (item: HistoryItem) => Promise<void>;
  clearAll: () => Promise<void>;
  setFilter: (filter: Partial<HistoryFilter>) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  filter: { query: "", platform: "all", status: "all" },
  isLoading: false,

  fetchHistory: async (filterOverride) => {
    set({ isLoading: true });
    const currentFilter = filterOverride || get().filter;
    const items = await historyService.getHistory(currentFilter);
    set({ items, isLoading: false });
  },

  addItem: async (item) => {
    await historyService.addHistoryItem(item);
    await get().fetchHistory();
  },

  clearAll: async () => {
    await historyService.clearHistory();
    set({ items: [] });
  },

  setFilter: (partial) => {
    const updated = { ...get().filter, ...partial };
    set({ filter: updated });
    get().fetchHistory(updated);
  }
}));
