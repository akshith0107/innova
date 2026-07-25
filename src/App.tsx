import React, { useState } from 'react';
import type { ViewMode, VerificationResult } from './types/pramaan';
import { MOCK_VERIFICATION_APPLES } from './data/mockData';
import { AmbientBackground } from './components/common/AmbientBackground';
import { Navbar } from './components/common/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { LiveDemoSection } from './components/landing/LiveDemoSection';
import { HowPramaanThinks } from './components/landing/HowPramaanThinks';
import { EvidenceNetwork } from './components/landing/EvidenceNetwork';
import { WorksEverywhere } from './components/landing/WorksEverywhere';
import { LandingCTA } from './components/landing/LandingCTA';
import { ExtensionOverlay } from './components/extension/ExtensionOverlay';
import { VerificationLab } from './components/workspace/VerificationLab';
import { ReportViewer } from './components/workspace/ReportViewer';
import { VerificationHistory } from './components/workspace/VerificationHistory';
import { SettingsModal } from './components/workspace/SettingsModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<VerificationResult>(MOCK_VERIFICATION_APPLES);

  const handleStartDemo = () => {
    setCurrentView('landing');
    const demoElement = document.getElementById('demo');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenWorkspace = () => {
    setCurrentView('workspace');
  };

  const handleOpenReport = (reportData?: VerificationResult) => {
    if (reportData) {
      setActiveReport(reportData);
    }
    setCurrentView('report');
    setIsExtensionOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-white selection:bg-purple-600/30 selection:text-purple-200">
      {/* Ambient background particles & radial lights */}
      <AmbientBackground />

      {/* Editorial Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isExtensionOpen={isExtensionOpen}
        onToggleExtension={() => setIsExtensionOpen(!isExtensionOpen)}
      />

      {/* Main View Router */}
      <main className="relative z-10">
        {currentView === 'landing' && (
          <>
            <HeroSection
              onStartDemo={handleStartDemo}
              onOpenWorkspace={handleOpenWorkspace}
            />
            <LiveDemoSection />
            <HowPramaanThinks />
            <EvidenceNetwork />
            <WorksEverywhere />
            <LandingCTA onOpenWorkspace={handleOpenWorkspace} />
          </>
        )}

        {currentView === 'workspace' && (
          <VerificationLab onOpenReport={handleOpenReport} />
        )}

        {currentView === 'report' && (
          <ReportViewer
            result={activeReport}
            onBack={() => setCurrentView('workspace')}
          />
        )}

        {currentView === 'history' && (
          <VerificationHistory onSelectReport={handleOpenReport} />
        )}

        {currentView === 'settings' && <SettingsModal />}
      </main>

      {/* 420px Floating Extension Workspace Overlay Drawer */}
      <ExtensionOverlay
        isOpen={isExtensionOpen}
        onClose={() => setIsExtensionOpen(false)}
        onOpenReport={() => handleOpenReport(MOCK_VERIFICATION_APPLES)}
      />

      {/* Editorial Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12 px-6 bg-[#09090B]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold tracking-wider">PRAMAAN</span>
            <span>•</span>
            <span>THE AI TRUST LAYER</span>
          </div>
          <span>© 2026 PRAMAAN Trust Protocol. Truth. Verified. Always.</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
