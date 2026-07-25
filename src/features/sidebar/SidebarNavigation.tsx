import React from "react";
import { Tabs, type TabItem } from "../../components/ui/Tabs";
import { useSidebarStore, type SidebarTab } from "../../stores/sidebar.store";
import { useVerificationStore } from "../../stores/verification.store";
import { LayoutDashboard, FileText, Layers, Activity, BookOpen, History, Settings } from "lucide-react";

export const SidebarNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useSidebarStore();
  const { currentSession } = useVerificationStore();

  const claimsCount = currentSession?.claims.length ?? 0;

  const tabs: TabItem[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "claims", label: "Claims", badge: claimsCount > 0 ? claimsCount : undefined, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "evidence", label: "Evidence", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "timeline", label: "Timeline", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "sources", label: "Sources", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "history", label: "History", icon: <History className="w-3.5 h-3.5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="p-3 border-b border-border/60 shrink-0 bg-surface/50 overflow-x-auto scrollbar-none">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as SidebarTab)} />
    </div>
  );
};
