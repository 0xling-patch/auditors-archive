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
        bg: "#16161A",
        "bg-deep": "#0F0F14",
        "bg-card": "#141414",
        text: "#C8C8CC",
        "text-bright": "#E8E4F0",
        accent: "#E85D3F",
        "accent-orange": "#FF6B35",
        plum: "#2A1F2E",
        "plum-bright": "#3D2A42",
        border: "#2A2A30",
        "border-card": "#2A2A30",
        divider: "#25252A",
        critical: "#FF4444",
        high: "#FF6B35",
        medium: "#FFB800",
        low: "#6B7280",
        terminal: "#4ADE80",
      },
      fontFamily: {
        mono: ["SF Mono", "Consolas", "Menlo", "Monaco", "Courier New", "monospace"],
      },
      maxWidth: {
        content: "700px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
