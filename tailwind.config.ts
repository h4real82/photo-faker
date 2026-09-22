import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#121317",
        foreground: "#f4f4f5",
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        surface: {
          DEFAULT: "#121317",
          lowest: "#0d0e12",
          low: "#16171d",
          base: "#1a1b22",
          border: "#2d2e35",
          hover: "#22232d",
          container: "#1f1f24",
          "container-low": "#1a1b20",
          "container-high": "#292a2e",
          "container-highest": "#343439",
          "container-lowest": "#0d0e12",
        },
        gold: {
          accent: "#f59e0b",
          light: "#fbbf24",
          dark: "#b45309",
        },
        primary: {
          DEFAULT: "#d0bcff",
          container: "#a078ff",
          fixed: "#e9ddff",
          "fixed-dim": "#d0bcff",
        },
        secondary: {
          DEFAULT: "#ffb95f",
          container: "#ee9800",
          fixed: "#ffddb8",
          "fixed-dim": "#ffb95f",
        },
        tertiary: {
          DEFAULT: "#ffb0cd",
          container: "#f751a1",
          fixed: "#ffd9e4",
        },
        "on-surface": "#e3e2e8",
        "on-surface-variant": "#cbc3d7",
        outline: "#958ea0",
        "outline-variant": "#494454",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "glow-violet": "0 0 25px -5px rgba(139, 92, 246, 0.4)",
        "glow-amber": "0 0 20px -5px rgba(245, 158, 11, 0.35)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
