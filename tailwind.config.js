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
          ink: "#faf5ea",
          night: "#10110e",
          muted: "#beb7a9",
          line: "rgba(255, 255, 255, 0.12)",
          canvas: "#10110e",
          panel: "#1b1c17",
          leaf: "#ff9d16",
          leafDark: "#f28a00",
          mint: "rgba(255, 157, 22, 0.14)",
          lime: "#ff9d16",
          gold: "#ff9d16",
          saffron: "#ffb23d",
          cream: "#faf5ea",
          coral: "#ff6b4a",
          sky: "#ffb23d",
        },
      },
      boxShadow: {
        "tagam-soft": "0 22px 70px rgba(0, 0, 0, 0.42)",
        "tagam-card": "0 12px 34px rgba(0, 0, 0, 0.25)",
        "tagam-lift": "0 18px 50px rgba(0, 0, 0, 0.36)",
      },
      fontFamily: {
        sans: ["Inter", "Nunito", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
