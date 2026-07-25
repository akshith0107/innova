import { create } from "zustand";
import type { ToastMessage, ToastType } from "../components/ui/Toast";
import { generateId } from "../utils";

interface UIState {
  isOnboardingCompleted: boolean;
  activeModal: string | null;
  toasts: ToastMessage[];

  setOnboardingCompleted: (completed: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (title: string, description?: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnboardingCompleted: false,
  activeModal: null,
  toasts: [],

  setOnboardingCompleted: (completed) => set({ isOnboardingCompleted: completed }),

  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  addToast: (title, description, type = "info") => {
    const id = generateId("tst");
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type }]
    }));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 4000);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
