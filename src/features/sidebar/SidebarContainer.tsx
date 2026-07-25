import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarFooter } from "./SidebarFooter";
import { OverviewView } from "../overview/OverviewView";
import { ClaimsView } from "../claims/ClaimsView";
import { EvidenceView } from "../evidence/EvidenceView";
import { EvidenceDrawer } from "../evidence/EvidenceDrawer";
import { TimelineView } from "../timeline/TimelineView";
import { SourcesView } from "../sources/SourcesView";
import { HistoryView } from "../history/HistoryView";
import { SettingsView } from "../settings/SettingsView";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import { useSidebarStore } from "../../stores/sidebar.store";
import { useSettingsStore } from "../../stores/settings.store";
import { ScrollArea } from "../../components/ui/ScrollArea";
import { PanelRightOpen } from "lucide-react";
import { IconButton } from "../../components/ui/Button";

export const SidebarContainer: React.FC = () => {
  const { isOpen, isCollapsed, width, activeTab, toggleOpen, setWidth, toggleCollapse } =
    useSidebarStore();
  const { settings } = useSettingsStore();
  const [isResizing, setIsResizing] = useState(false);
  const dragStartXRef = useRef(0);
  const startWidthRef = useRef(width);

  // Global Keyboard Shortcut Listener (Alt+Shift+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === "KeyV") {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleOpen]);

  // Resizing logic via left drag handle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    dragStartXRef.current = e.clientX;
    startWidthRef.current = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = dragStartXRef.current - moveEvent.clientX;
      setWidth(startWidthRef.current + deltaX);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  // Render active section view
  const renderActiveView = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewView />;
      case "claims":
        return <ClaimsView />;
      case "evidence":
        return <EvidenceView />;
      case "timeline":
        return <TimelineView />;
      case "sources":
        return <SourcesView />;
      case "history":
        return <HistoryView />;
      case "settings":
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCollapsed ? (
          /* Collapsed Floating Pill Trigger */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-6 right-6 z-[999999] pointer-events-auto"
          >
            <IconButton
              icon={<PanelRightOpen className="w-5 h-5 text-white" />}
              label="Expand PRAMAAN Sidebar"
              size="lg"
              onClick={toggleCollapse}
              className="bg-accent shadow-glow-accent border border-accent/40 rounded-full"
            />
          </motion.div>
        ) : (
          /* Expanded Floating Sidebar Window */
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            style={{ width: `${width}px` }}
            className="fixed top-4 right-4 bottom-4 z-[999999] pointer-events-auto flex flex-col bg-surface/90 backdrop-blur-2xl border border-border rounded-32 shadow-floating glass-panel overflow-hidden"
          >
            {/* Left Edge Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={`absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize z-50 hover:bg-accent/40 transition-colors ${
                isResizing ? "bg-accent" : "transparent"
              }`}
            />

            {/* Header */}
            <SidebarHeader />

            {/* Navigation Bar */}
            <SidebarNavigation />

            {/* Scrollable Content View */}
            <div className="flex-1 overflow-hidden p-4">
              <ScrollArea className="h-full pr-1">{renderActiveView()}</ScrollArea>
            </div>

            {/* Footer */}
            <SidebarFooter />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Evidence Drawer */}
      <EvidenceDrawer />

      {/* Welcome Onboarding Modal */}
      <OnboardingModal />
    </>
  );
};
