import React, { useEffect } from "react";
import { AppProviders } from "../../../providers";
import { contentEngine } from "../engine/content-engine";
import { SidebarContainer } from "../../sidebar/SidebarContainer";

export const ContentOverlayRoot: React.FC = () => {
  useEffect(() => {
    // Boot Content Engine when mounted inside host AI platform
    contentEngine.initialize();

    return () => {
      contentEngine.shutdown();
    };
  }, []);

  return (
    <AppProviders>
      <div id="pramaan-content-root" className="pramaan-root select-none font-sans">
        <SidebarContainer />
      </div>
    </AppProviders>
  );
};
