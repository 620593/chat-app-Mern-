/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: "rgba(255, 255, 255, 0.05)",
        glassBorder: "rgba(255, 255, 255, 0.1)",
        neonPurple: "#7c3aed",
        neonBlue: "#3b82f6",
        darkBg: "#020617",
        darkPanel: "#0f172a",
      }
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require("daisyui")],
};
