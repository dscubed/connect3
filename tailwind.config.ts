import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary)/<alpha-value>)",
          foreground: "rgb(var(--primary-foreground)/<alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary)/<alpha-value>)",
          foreground: "rgb(var(--secondary-foreground)/<alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted)/<alpha-value>)",
          foreground: "rgb(var(--muted-foreground)/<alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent)/<alpha-value>)",
          foreground: "rgb(var(--accent-foreground)/<alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive)/<alpha-value>)",
          foreground: "rgb(var(--destructive-foreground)/<alpha-value>)",
        },
        border: "rgb(var(--border)/<alpha-value>)",
        input: "rgb(var(--input)/<alpha-value>)",
        ring: "rgb(var(--ring)/<alpha-value>)",
        chart: {
          "1": "rgb(var(--chart-1) / <alpha-value>)",
          "2": "rgb(var(--chart-2)/<alpha-value>)",
          "3": "rgb(var(--chart-3)/<alpha-value>)",
          "4": "rgb(var(--chart-4)/<alpha-value>)",
          "5": "rgb(var(--chart-5)/<alpha-value>)",
        },
      },
      fontFamily: {
        fredoka: ["var(--font-fredoka)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      screens: {
        xs: "440px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
