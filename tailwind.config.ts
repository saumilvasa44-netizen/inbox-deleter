import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#120b0b",
        panel: "#1a1010",
        panel2: "#211414",
        border: "#3a1f1f",
        accent: "#dc2626",
        good: "#22c55e",
        warn: "#f59e0b",
        bad: "#ef4444",
        muted: "#a08787",
      },
    },
  },
  plugins: [],
};
export default config;
