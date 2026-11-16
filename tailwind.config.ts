import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Trust: 7.5:1 with white
        teal: {
          DEFAULT: "#1B5E55",
          50: "#EEF5F3",
          100: "#D6E8E3",
          700: "#174F48",
          800: "#123F39",
          900: "#0C2B27",
        },
        // Active Action. #D95338 is the brand coral (4.0:1 with white → large text / decorative only).
        // coral-600 (#C2452B, 5.0:1 with white) is used behind small white button text for WCAG AA.
        coral: {
          DEFAULT: "#D95338",
          50: "#FDF1EE",
          100: "#F9DCD5",
          600: "#C2452B",
          700: "#A93A23",
        },
        // Policy Support: 7.1:1 with ink text
        sage: {
          DEFAULT: "#87AFA4",
          50: "#F1F6F4",
          100: "#DCE9E5",
          200: "#C3D8D2",
        },
        canvas: "#F8FAF9",
        ink: "#0F1F1C",
        slate: { DEFAULT: "#4A5D57" },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          // Scripts Inter doesn't cover
          '"PingFang SC"',
          '"Noto Sans SC"',
          '"Microsoft YaHei"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          '"Kohinoor Devanagari"',
          '"Noto Sans Devanagari"',
          '"Nirmala UI"',
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "28px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,31,28,0.04), 0 12px 32px -12px rgba(15,31,28,0.18)",
        lift: "0 24px 48px -20px rgba(27,94,85,0.35)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "fade-up": "fade-up 0.35s ease-out both",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
