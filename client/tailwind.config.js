/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff8ff",
          100: "#dbeffe",
          200: "#bfe3fd",
          300: "#93d1fb",
          400: "#60b6f7",
          500: "#3b96f2",
          600: "#1d77e7",
          700: "#1660d4",
          800: "#184fac",
          900: "#1a4488",
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
        medical: {
          bg: "#f0f7ff",
          card: "#ffffff",
          border: "#e0eeff",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        neuro: "8px 8px 16px #d1dce8, -8px -8px 16px #ffffff",
        "neuro-dark": "8px 8px 16px #0a1628, -8px -8px 16px #162240",
        glass: "0 8px 32px 0 rgba(31, 58, 147, 0.12)",
        "glass-lg": "0 16px 48px 0 rgba(31, 58, 147, 0.18)",
        glow: "0 0 20px rgba(59, 150, 242, 0.4)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.4)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.4)",
        "glow-yellow": "0 0 20px rgba(234, 179, 8, 0.4)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        scan: "scan 2s linear infinite",
        "heartbeat": "heartbeat 1.2s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 15px rgba(59,150,242,0.4)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 30px rgba(59,150,242,0.7)" },
        },
        scan: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.15)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(1)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
