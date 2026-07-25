import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const sidePos = {
    top: "-top-10 left-1/2 -translate-x-1/2 mb-2",
    bottom: "-bottom-10 left-1/2 -translate-x-1/2 mt-2",
    left: "top-1/2 -left-2 -translate-x-full -translate-y-1/2 mr-2",
    right: "top-1/2 -right-2 translate-x-full -translate-y-1/2 ml-2"
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-[1200] whitespace-nowrap px-2.5 py-1 text-xs font-medium text-primary bg-surface-elevated border border-border rounded-lg shadow-glass pointer-events-none",
              sidePos[side],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
