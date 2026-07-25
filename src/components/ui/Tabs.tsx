import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils";

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-surface-elevated rounded-2xl border border-border", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl transition-colors duration-150 select-none",
              isActive ? "text-primary font-semibold" : "text-primary-muted hover:text-primary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-accent/20 border border-accent/40 rounded-xl shadow-glow-accent/20"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {tab.icon && <span className="relative z-10 text-current">{tab.icon}</span>}
            <span className="relative z-10">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "relative z-10 px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold",
                  isActive ? "bg-accent text-white" : "bg-white/10 text-primary-muted"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
