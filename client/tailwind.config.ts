import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#dceffd",
          500: "#2076d2",
          600: "#145fb8",
          700: "#0f4f98",
        },
        clinical: {
          mint: "#dff7ef",
          aqua: "#e6fbff",
          ink: "#162033",
        },
      },
      boxShadow: {
        panel: "0 18px 45px rgba(18, 47, 91, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
