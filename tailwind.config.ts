import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08111a",
        panel: "#101c29",
        panelSoft: "#172636",
        line: "#24384d",
        valorant: "#ff4655",
        mint: "#36f2b4",
        gold: "#f4c95d",
      },
      boxShadow: {
        glow: "0 0 40px rgba(54, 242, 180, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
