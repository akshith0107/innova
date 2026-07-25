import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Debounces execution of a function
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delayMs);
  }) as T;
}

/**
 * Throttles execution of a function
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, limitMs: number): T {
  let lastRun = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limitMs) {
      lastRun = now;
      fn(...args);
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        lastRun = Date.now();
        fn(...args);
      }, limitMs - (now - lastRun));
    }
  }) as T;
}

/**
 * Generates a unique nanoid/uuid fallback string
 */
export function generateId(prefix = "id"): string {
  const randomStr = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now().toString(36).slice(-4);
  return `${prefix}_${timestamp}${randomStr}`;
}

/**
 * Formats timestamp to localized date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Formats timestamp into relative human-readable string (e.g., "2m ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return formatDate(timestamp);
}

/**
 * Formats shortcut key string for UI display
 */
export function keyboardShortcut(shortcutStr: string): string {
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  if (isMac) {
    return shortcutStr.replace("Alt", "⌥").replace("Shift", "⇧").replace("+", "");
  }
  return shortcutStr;
}

/**
 * Maps confidence score (0 - 100) to design system color hex & class
 */
export function confidenceToColour(confidence: number): {
  hex: string;
  badgeClass: string;
  textClass: string;
  label: string;
} {
  if (confidence >= 80) {
    return {
      hex: "#22C55E",
      badgeClass: "bg-status-success/15 text-status-success border-status-success/30",
      textClass: "text-status-success",
      label: "High Confidence"
    };
  }
  if (confidence >= 50) {
    return {
      hex: "#FACC15",
      badgeClass: "bg-status-warning/15 text-status-warning border-status-warning/30",
      textClass: "text-status-warning",
      label: "Moderate Confidence"
    };
  }
  return {
    hex: "#EF4444",
    badgeClass: "bg-status-danger/15 text-status-danger border-status-danger/30",
    textClass: "text-status-danger",
    label: "Low Confidence"
  };
}

/**
 * Extracts complete sentences from streaming text blocks
 */
export function extractSentences(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}
