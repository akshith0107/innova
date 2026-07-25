import { create } from 'zustand';

interface SettingsStoreState {
  isEnabled: boolean;
  sensitivityThreshold: number;
  keyboardShortcut: string;
  autoHighlight: boolean;
  theme: 'dark' | 'system';

  // Actions
  setIsEnabled: (enabled: boolean) => void;
  setSensitivityThreshold: (threshold: number) => void;
  setKeyboardShortcut: (shortcut: string) => void;
  setAutoHighlight: (autoHighlight: boolean) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  isEnabled: true,
  sensitivityThreshold: 85,
  keyboardShortcut: 'Alt+Shift+V',
  autoHighlight: true,
  theme: 'dark',

  setIsEnabled: (isEnabled) => set({ isEnabled }),
  setSensitivityThreshold: (sensitivityThreshold) => set({ sensitivityThreshold }),
  setKeyboardShortcut: (keyboardShortcut) => set({ keyboardShortcut }),
  setAutoHighlight: (autoHighlight) => set({ autoHighlight }),
}));
