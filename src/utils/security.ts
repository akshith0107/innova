/**
 * Security & Sanitization Utilities for PRAMAAN
 */

export function sanitizeHTML(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function validateMessageOrigin(sender: chrome.runtime.MessageSender): boolean {
  if (!sender) return false;
  // Verify message origin matches extension ID or supported origin
  if (sender.id && chrome.runtime && sender.id === chrome.runtime.id) {
    return true;
  }
  return false;
}

export function maskSensitiveToken(token: string): string {
  if (!token || token.length < 8) return "********";
  return `${token.substring(0, 4)}...${token.slice(-4)}`;
}
