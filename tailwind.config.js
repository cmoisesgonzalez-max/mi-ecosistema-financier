/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { 50: "#FEF8F3", 100: "#F9F4EE", 200: "#F5EBE1" },
        sage:  { DEFAULT: "#C9E4C8", dark: "#3B6D11" },
        blush: { DEFAULT: "#F0D9D4", dark: "#993C1D" },
        sky:   { DEFAULT: "#C5D9ED", dark: "#185FA5" },
        sand:  { DEFAULT: "#E8D4BC", dark: "#BA7517" },
      },
    },
  },
  plugins: [],
};
