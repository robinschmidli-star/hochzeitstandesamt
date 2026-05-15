import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#222222",
        "soft-ink": "#5F5F5A",
        paper: "#F7F5F2",
        linen: "#EFEDE8",
        champagne: "#C7A26A",
        rose: "#D8C49E",
        sage: "#1F3A36"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"]
      },
      borderRadius: {
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(31, 58, 54, 0.055)"
      }
    }
  },
  plugins: []
};

export default config;
