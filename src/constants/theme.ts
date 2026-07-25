// PRAMAAN Ultra-Premium Design Tokens & System Constants

export const COLORS = {
  background: "#09090B",
  surface: {
    DEFAULT: "#111113",
    elevated: "#18181B",
    subtle: "#141416"
  },
  border: {
    DEFAULT: "rgba(255, 255, 255, 0.06)",
    subtle: "rgba(255, 255, 255, 0.03)",
    strong: "rgba(255, 255, 255, 0.12)",
    accent: "rgba(124, 58, 237, 0.4)"
  },
  text: {
    primary: "#FAFAFA",
    secondary: "#A1A1AA",
    tertiary: "#71717A",
    muted: "#52525B"
  },
  accent: {
    DEFAULT: "#7C3AED",
    hover: "#6D28D9",
    glow: "rgba(124, 58, 237, 0.25)",
    muted: "rgba(124, 58, 237, 0.15)"
  },
  status: {
    success: "#22C55E",
    successGlow: "rgba(34, 197, 94, 0.2)",
    warning: "#FACC15",
    warningGlow: "rgba(250, 204, 21, 0.2)",
    danger: "#EF4444",
    dangerGlow: "rgba(239, 68, 68, 0.2)",
    info: "#3B82F6"
  }
} as const;

export const RADII = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  r24: "24px",
  r32: "32px",
  r40: "40px",
  full: "9999px"
} as const;

export const SPACING = {
  grid: 8,
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px"
} as const;

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  tooltip: 1200,
  modalOverlay: 1300,
  modal: 1400,
  toast: 1500,
  sidebarHost: 999990,
  sidebarOverlay: 999999
} as const;

export const ANIMATION_VARIANTS = {
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30
  },
  smooth: {
    duration: 0.25,
    ease: [0.16, 1, 0.3, 1]
  },
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.18 }
  },
  sidebarSlide: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 32 }
  }
} as const;
