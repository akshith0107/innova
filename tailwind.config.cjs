/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,html,js,jsx}", "./index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        surface: {
          DEFAULT: "#111113",
          elevated: "#18181B"
        },
        border: "rgba(255, 255, 255, 0.06)",
        accent: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          glow: "rgba(124, 58, 237, 0.25)"
        }
      }
    }
  },
  plugins: []
};
