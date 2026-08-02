/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF5",
        foreground: "#2D2D2D",
        card: "#FFFFFF",
        "card-foreground": "#2D2D2D",
        primary: {
          DEFAULT: "#E94B3C",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F0",
          foreground: "#2D2D2D",
        },
        muted: {
          DEFAULT: "#F5F5F0",
          foreground: "#6B6B6B",
        },
        accent: {
          DEFAULT: "#4FC3F7",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#E94B3C",
          foreground: "#FFFFFF",
        },
        border: "#E5E5E0",
        ring: "#4FC3F7",
        steam: {
          science: "#E94B3C",
          technology: "#7CB342",
          engineering: "#4FC3F7",
          arts: "#FDD835",
          mathematics: "#7E57C2",
        },
      },
      borderRadius: {
        DEFAULT: "16px",
      },
    },
  },
  plugins: [],
};
