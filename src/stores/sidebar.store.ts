import { create } from "zustand";
import { SIDEBAR_WIDTH_DEFAULT, SIDEBAR_WIDTH_MAX, SIDEBAR_WIDTH_MIN } from "../constants";

export type SidebarTab =
  | "overview"
  | "claims"
  | "evidence"
  | "sources"
  | "timeline"
  | "history"
  | "settings";

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
  activeTab: SidebarTab;
  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
  toggleCollapse: () => void;
  setWidth: (width: number) => void;
  setActiveTab: (tab: SidebarTab) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isCollapsed: false,
  width: SIDEBAR_WIDTH_DEFAULT,
  activeTab: "overview",

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

  setWidth: (newWidth) => {
    const clamped = Math.min(
      SIDEBAR_WIDTH_MAX,
      Math.max(SIDEBAR_WIDTH_MIN, newWidth)
    );
    set({ width: clamped });
  },

  setActiveTab: (tab) => set({ activeTab: tab })
}));
