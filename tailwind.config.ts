import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ADONIS AI Platform Color System
        background: {
          DEFAULT: "#07070f",
          secondary: "#0d0d1a",
          tertiary: "#111127",
        },
        border: {
          DEFAULT: "rgba(139, 92, 246, 0.12)",
          subtle: "rgba(255, 255, 255, 0.06)",
          bright: "rgba(139, 92, 246, 0.3)",
        },
        accent: {
          purple: "#8b5cf6",
          violet: "#7c3aed",
          blue: "#3b82f6",
          cyan: "#06b6d4",
          indigo: "#6366f1",
        },
        glow: {
          purple: "rgba(139, 92, 246, 0.4)",
          blue: "rgba(59, 130, 246, 0.4)",
          cyan: "rgba(6, 182, 212, 0.4)",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          tertiary: "#64748b",
          accent: "#a78bfa",
        },
        status: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-ai":
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-purple":
          "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #07070f 0%, #0d0d1a 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
        "glow-purple":
          "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        "glow-blue":
          "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "typing": "typing 1.5s steps(30) infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(139, 92, 246, 0.2)",
          },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        typing: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      boxShadow: {
        "glow-purple": "0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.1)",
        "glow-blue": "0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.1)",
        "glow-cyan": "0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(6, 182, 212, 0.1)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.5)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.15)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
