/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  darkMode: ["class", '[data-theme="dark"]'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        tagam: {
          ink: "#17201b",
          night: "#101815",
          muted: "#66736c",
          line: "#dfe8e1",
          canvas: "#f5f8f2",
          panel: "#ffffff",
          leaf: "#0f8a5f",
          leafDark: "#086346",
          mint: "#dff5e8",
          lime: "#b7e457",
          gold: "#f5aa16",
          saffron: "#f8c24e",
          cream: "#fff7e6",
          coral: "#ef6d5a",
          sky: "#2389da",
        },
      },
      boxShadow: {
        "tagam-soft": "0 24px 70px rgba(23, 32, 27, 0.12)",
        "tagam-card": "0 14px 38px rgba(23, 32, 27, 0.08)",
        "tagam-lift": "0 18px 50px rgba(16, 24, 21, 0.13)",
      },
      fontFamily: {
        sans: ["Nunito", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
