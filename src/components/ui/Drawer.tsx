import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils";
import { IconButton } from "./Button";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "right" | "bottom";
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = "bottom",
  className
}) => {
  const slideVariants = {
    bottom: {
      initial: { y: "100%", opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: "100%", opacity: 0 }
    },
    right: {
      initial: { x: "100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "100%", opacity: 0 }
    }
  };

  const posClasses = {
    bottom: "bottom-0 inset-x-0 rounded-t-32 max-h-[85vh]",
    right: "top-0 right-0 bottom-0 w-[400px] max-w-full rounded-l-32"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[1300] overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          <motion.div
            initial={slideVariants[side].initial}
            animate={slideVariants[side].animate}
            exit={slideVariants[side].exit}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "absolute z-10 bg-surface border border-border p-6 shadow-floating flex flex-col",
              posClasses[side],
              className
            )}
          >
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4 shrink-0">
              {title && <h3 className="text-base font-semibold text-primary">{title}</h3>}
              <IconButton icon={<X className="w-4 h-4" />} label="Close Drawer" onClick={onClose} size="sm" />
            </div>
            <div className="flex-1 overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
