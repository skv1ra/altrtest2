import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090909",
        panel: "rgba(255,255,255,0.055)",
        line: "rgba(255,255,255,0.12)",
        muted: "rgba(255,255,255,0.58)",
      },
      fontFamily: {
        display: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 70px rgba(78, 135, 255, 0.20)",
        violet: "0 0 90px rgba(155, 92, 255, 0.18)",
      },
      backgroundImage: {
        radial: "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
