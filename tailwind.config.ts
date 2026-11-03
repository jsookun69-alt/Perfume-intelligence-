import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cave: { DEFAULT: "#0c231b", 900: "#07150f", 800: "#0c231b", 700: "#123327", 600: "#1a4535", 500: "#245a46" },
        ivory: { DEFAULT: "#f6f0e4", 50: "#fbf8f1", 100: "#f6f0e4", 200: "#ece3d1", 300: "#ddd0b8" },
        champagne: { DEFAULT: "#d4b483", 300: "#ecd9b4", 400: "#e2c696", 500: "#d4b483", 600: "#b8925a", 700: "#8f6d3c" },
        ink: { DEFAULT: "#1d1a16", soft: "#4a443b", mute: "#7d7466" },
        rose: { clay: "#b9785f" },
      },
      fontFamily: {
        serif: ["'Fraunces Variable'", "Georgia", "serif"],
        sans: ["'Manrope Variable'", "system-ui", "sans-serif"],
      },
      letterSpacing: { luxe: "0.28em" },
      transitionTimingFunction: { luxe: "cubic-bezier(.2,.8,.2,1)" },
      maxWidth: { page: "88rem" },
    },
  },
  plugins: [],
};
export default config;
