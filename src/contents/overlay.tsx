import type { PlasmoCSConfig } from 'plasmo';
import React, { useEffect } from 'react';
import styleText from 'data-text:../index.css';
import { LLMStreamDetector } from './stream-detector';
import { InlineSentenceHighlighter } from './highlighter';
import { FloatingSidebar } from '../sidebar/FloatingSidebar';
import { EvidenceDrawer } from '../components/inline/EvidenceDrawer';
import { useVerificationStore } from '../stores/useVerificationStore';
import { useSidebarStore } from '../stores/useSidebarStore';
import { VerificationService } from '../services/verify';
import { ShieldCheck } from 'lucide-react';

export const config: PlasmoCSConfig = {
  matches: [
    'https://chat.openai.com/*',
    'https://chatgpt.com/*',
    'https://gemini.google.com/*',
    'https://claude.ai/*',
    'https://perplexity.ai/*',
    'https://grok.com/*',
    'https://deepseek.com/*',
    'https://copilot.microsoft.com/*',
    'https://github.com/*'
  ]
};

export const getStyle = () => {
  const style = document.createElement('style');
  style.textContent = styleText as unknown as string;
  return style;
};

export const PlasmoOverlay = () => {
  const { addClaim } = useVerificationStore();
  const { isOpen, toggleSidebar, openEvidenceDrawer } = useSidebarStore();

  useEffect(() => {
    // 1. Listen for background service worker messages (e.g. TOGGLE_SIDEBAR)
    const messageListener = (message: any, _sender: any, sendResponse: any) => {
      if (message && message.action === 'TOGGLE_SIDEBAR') {
        toggleSidebar();
        if (sendResponse) sendResponse({ success: true });
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
    }

    // 2. Start MutationObserver for streaming LLM text
    const detector = new LLMStreamDetector((sentenceText, element) => {
      VerificationService.verifySentenceClaim(sentenceText).then((verifiedClaim) => {
        addClaim(verifiedClaim);

        InlineSentenceHighlighter.applyInlineHighlight(
          verifiedClaim,
          element,
          (clickedClaim) => {
            openEvidenceDrawer(clickedClaim);
          }
        );
      });
    });

    detector.start();

    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
      detector.stop();
    };
  }, [addClaim, openEvidenceDrawer, toggleSidebar]);

  return (
    <div className="pramaan-shadow-container font-sans text-white">
      {/* Floating Trigger Widget Button on Top-Right of Screen */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-6 right-6 z-[99999] px-4 py-2.5 rounded-full bg-[#111113]/95 backdrop-blur-xl border border-purple-500/50 text-white font-mono text-xs font-semibold shadow-[0_10px_35px_rgba(124,58,237,0.4)] hover:scale-105 transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span>PRAMAAN UI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Floating Resizable Workspace Sidebar on Right Side of Screen */}
      <FloatingSidebar />

      {/* Evidence Drawer Overlay */}
      <EvidenceDrawer />
    </div>
  );
};

export default PlasmoOverlay;
