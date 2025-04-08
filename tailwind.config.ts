import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        "safe-t": "env(safe-area-inset-top)",
        "safe-b": "env(safe-area-inset-bottom)",
        "safe-l": "env(safe-area-inset-left)",
        "safe-r": "env(safe-area-inset-right)",
        "safe-t-10": "calc(env(safe-area-inset-top) + 2.5rem)",
        "safe-t-12": "calc(env(safe-area-inset-top) + 3rem)",
        "safe-b-12": "calc(env(safe-area-inset-bottom) + 3rem)",
        "safe-b-4": "calc(env(safe-area-inset-bottom) + 1rem)",
      },
      fontSize: {
        xs: "0.8125rem",
        base: "1.0625rem",
      },
      lineHeight: {
        xs: "1.0625rem",
        base: "1.5625rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
