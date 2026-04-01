import { hexToHSL, getCSSVariable } from "./src/lib/utils";

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        sans: ["Be Vietnam Pro", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          light: "hsl(var(--primary-light))",
          5: "hsl(var(--primary-5))",
          10: "hsl(var(--primary-10))",
          15: "hsl(var(--primary-15))",
          20: "hsl(var(--primary-20))",
          25: "hsl(var(--primary-25))",
          30: "hsl(var(--primary-30))",
          35: "hsl(var(--primary-35))",
          40: "hsl(var(--primary-40))",
          45: "hsl(var(--primary-45))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          5: "hsl(var(--secondary-5))",
          10: "hsl(var(--secondary-10))",
          15: "hsl(var(--secondary-15))",
          20: "hsl(var(--secondary-20))",
          25: "hsl(var(--secondary-25))",
          30: "hsl(var(--secondary-30))",
          35: "hsl(var(--secondary-35))",
          40: "hsl(var(--secondary-40))",
          45: "hsl(var(--secondary-45))",
          50: "hsl(var(--secondary-50))",
          100: "hsl(var(--secondary-100))",
          200: "hsl(var(--secondary-200))",
          300: "hsl(var(--secondary-300))",
          400: "hsl(var(--secondary-400))",
          500: "hsl(var(--secondary-500))",
          600: "hsl(var(--secondary-600))",
          700: "hsl(var(--secondary-700))",
          800: "hsl(var(--secondary-800))",
          900: "hsl(var(--secondary-900))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },

        // dark
        dark: {
          DEFAULT: "hsl(var(--dark))",
          50: "hsl(var(--dark-50))",
          100: "hsl(var(--dark-100))",
          200: "hsl(var(--dark-200))",
          300: "hsl(var(--dark-300))",
          400: "hsl(var(--dark-400))",
          500: "hsl(var(--dark-500))",
          600: "hsl(var(--dark-600))",
          700: "hsl(var(--dark-700))",
          800: "hsl(var(--dark-800))",
          900: "hsl(var(--dark-900))",
        },

        // shades
        shades: {
          DEFAULT: "hsl(var(--shades))",
          1: "hsl(var(--shades-1))",
          2: "hsl(var(--shades-2))",
          3: "hsl(var(--shades-3))",
          4: "hsl(var(--shades-4))",
          5: "hsl(var(--shades-5))",
          6: "hsl(var(--shades-6))",
          7: "hsl(var(--shades-7))",
          8: "hsl(var(--shades-8))",
          9: "hsl(var(--shades-9))",
          10: "hsl(var(--shades-10))",
          11: "hsl(var(--shades-11))",
          12: "hsl(var(--shades-12))",
          13: "hsl(var(--shades-13))",
          14: "hsl(var(--shades-14))",
          15: "hsl(var(--shades-15))",
          16: "hsl(var(--shades-16))",
          17: "hsl(var(--shades-17))",
          18: "hsl(var(--shades-18))",
          19: "hsl(var(--shades-19))",
        },

        // notify
        notifySuccessBg: {
          DEFAULT: "hsl(var(--notify-success-bg))",
        },
        notifySuccessText: {
          DEFAULT: "hsl(var(--notify-success-text))",
        },
        notifyErrorBg: {
          DEFAULT: "hsl(var(--notify-error-bg))",
        },
        notifyErrorText: {
          DEFAULT: "hsl(var(--notify-error-text))",
        },
        notifyWarnBg: {
          DEFAULT: "hsl(var(--notify-warn-bg))",
        },
        notifyWarnText: {
          DEFAULT: "hsl(var(--notify-warn-text))",
        },
        notifyInfoBg: {
          DEFAULT: "hsl(var(--notify-info-bg))",
        },
        notifyInfoText: {
          DEFAULT: "hsl(var(--notify-info-text))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
