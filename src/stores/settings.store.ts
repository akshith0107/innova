import { create } from "zustand";
import { DEFAULT_SETTINGS } from "../constants";
import type { UserSettings } from "../types";
import { settingsService } from "../services/settings.service";

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true });
    const settings = await settingsService.getSettings();
    set({ settings, isLoading: false });
  },

  updateSettings: async (partial) => {
    const updated = await settingsService.updateSettings(partial);
    set({ settings: updated });
  },

  resetSettings: async () => {
    const reset = await settingsService.resetSettings();
    set({ settings: reset });
  }
}));
