import React from "react";
import { ShieldCheck, Wifi } from "lucide-react";
import { keyboardShortcut } from "../../utils";
import { useSettingsStore } from "../../stores/settings.store";

export const SidebarFooter: React.FC = () => {
  const { settings } = useSettingsStore();

  return (
    <footer className="p-3 px-4 border-t border-border/80 flex items-center justify-between shrink-0 text-[11px] text-primary-muted font-mono bg-surface-elevated/40 select-none">
      <div className="flex items-center gap-1.5 text-status-success">
        <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
        <span>Connected</span>
      </div>

      <div className="flex items-center gap-2 text-primary-muted/80">
        <Wifi className="w-3 h-3 text-accent" />
        <span>{keyboardShortcut(settings.keyboardShortcut)}</span>
      </div>
    </footer>
  );
};
