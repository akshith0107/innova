import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../utils";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-status-success" />,
    warning: <AlertTriangle className="w-4 h-4 text-status-warning" />,
    error: <AlertCircle className="w-4 h-4 text-status-danger" />,
    info: <Info className="w-4 h-4 text-accent" />
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1500] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-surface border border-border shadow-floating glass-panel text-xs text-primary"
            )}
          >
            <span className="shrink-0 mt-0.5">{iconMap[toast.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-primary">{toast.title}</p>
              {toast.description && (
                <p className="text-primary-muted mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-primary-muted hover:text-primary shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
