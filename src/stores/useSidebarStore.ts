import { create } from 'zustand';
import type { Claim } from '../types/verification';

export type SidebarTab = 'overview' | 'claims' | 'evidence' | 'timeline' | 'sources' | 'history';

interface SidebarStoreState {
  isOpen: boolean;
  activeTab: SidebarTab;
  widthPx: number;
  selectedClaimForDrawer: Claim | null;
  isDrawerOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setWidthPx: (width: number) => void;
  openEvidenceDrawer: (claim: Claim) => void;
  closeEvidenceDrawer: () => void;
}

export const useSidebarStore = create<SidebarStoreState>((set) => ({
  isOpen: true,
  activeTab: 'overview',
  widthPx: 420,
  selectedClaimForDrawer: null,
  isDrawerOpen: false,

  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  setSidebarOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setWidthPx: (widthPx) => set({ widthPx }),
  openEvidenceDrawer: (claim) =>
    set({ selectedClaimForDrawer: claim, isDrawerOpen: true }),
  closeEvidenceDrawer: () =>
    set({ isDrawerOpen: false, selectedClaimForDrawer: null })
}));
