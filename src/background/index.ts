import { VerificationService } from '../services/verify';
import type { ExtensionMessage } from '../types/messages';

console.log('[PRAMAAN Background Service Worker] Initialized.');

// Handle extension installation
chrome.runtime.onInstalled?.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[PRAMAAN] First run detected. Launching onboarding slides.');
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/onboarding')
    });
  }
});

// Handle global keyboard shortcuts (Alt + Shift + V)
chrome.commands?.onCommand.addListener((command) => {
  if (command === 'toggle-sidebar') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'TOGGLE_SIDEBAR',
          payload: {}
        }, () => {
          if (chrome.runtime.lastError) {
            // Silently ignore connection errors when active tab is an un-scripted page
          }
        });
      }
    });
  }
});

// Extension Background Message Handler
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const { action, payload } = message as any;

  if (action === 'VERIFY_STREAM_CHUNK') {
    const { sentenceText } = payload || {};

    VerificationService.verifySentenceClaim(sentenceText || '')
      .then((verifiedClaim) => {
        sendResponse({ success: true, claim: verifiedClaim });
      })
      .catch((err) => {
        console.error('[PRAMAAN Background] Verification error:', err);
        sendResponse({ success: false, error: err?.message || 'Verification failed' });
      });

    return true; // Keep message channel open for async response
  }

  if (action === 'TOGGLE_SIDEBAR') {
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { action: 'TOGGLE_SIDEBAR', payload: {} }, () => {
        if (chrome.runtime.lastError) {
          // Silently ignore connection error if receiving end does not exist
        }
      });
    }
    sendResponse({ success: true });
    return true;
  }

  // Default response for unhandled actions to prevent dangling channel errors
  sendResponse({ success: true });
  return true;
});
