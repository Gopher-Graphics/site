/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold:    "#FFCC33",
        "gold-light": "#FFE488",
        maroon:  "#7A0019",
        "maroon-deep": "#4A000F",
      },
      fontFamily: {
        ui: ["'Segoe UI'", "'Trebuchet MS'", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "4px",
      },
      animation: {
        "fade-up":   "fadeUp 0.6s ease both",
        "fade-up-d": "fadeUp 0.85s ease 0.15s both",
        "modal-in":  "modalIn 0.25s cubic-bezier(.34,1.46,.64,1)",
        "orb-float": "orbFloat 20s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        modalIn: {
          from: { opacity: "0", transform: "scale(0.9) translateY(24px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      boxShadow: {
        "glow-gold":   "0 0 20px rgba(255,204,51,0.3), 0 0 60px rgba(255,204,51,0.1)",
        "glow-maroon": "0 0 20px rgba(122,0,25,0.4),  0 0 60px rgba(122,0,25,0.15)",
      },
    },
  },
  plugins: [],
};
