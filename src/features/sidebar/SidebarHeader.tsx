import React from "react";
import { ShieldCheck, Settings, PanelRightClose } from "lucide-react";
import { IconButton } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useSidebarStore } from "../../stores/sidebar.store";
import { useVerificationStore } from "../../stores/verification.store";
import { APP_NAME } from "../../constants";

export const SidebarHeader: React.FC = () => {
  const { toggleCollapse, setActiveTab } = useSidebarStore();
  const { activePlatform, isVerifying } = useVerificationStore();

  return (
    <header className="p-4 border-b border-border/80 flex items-center justify-between shrink-0 glass-panel select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-2xl bg-accent flex items-center justify-center font-bold text-sm text-white shadow-glow-accent">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-primary">{APP_NAME}</span>
            <Badge variant="accent" size="sm">
              {activePlatform}
            </Badge>
          </div>
          <span className="text-[10px] text-primary-muted font-mono block">
            {isVerifying ? "● Verifying live stream..." : "System Active"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon={<Settings className="w-4 h-4" />}
          label="Open Settings"
          size="sm"
          onClick={() => setActiveTab("settings")}
        />
        <IconButton
          icon={<PanelRightClose className="w-4 h-4" />}
          label="Collapse Sidebar"
          size="sm"
          onClick={toggleCollapse}
        />
      </div>
    </header>
  );
};
