/** CSS vars hold full oklch() colors; color-mix enables Tailwind opacity (/50 etc). */
function cssColor(variable) {
  return `color-mix(in oklab, var(${variable}) calc(100% * <alpha-value>), transparent)`;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: cssColor("--border"),
        input: cssColor("--input"),
        ring: cssColor("--ring"),
        background: cssColor("--background"),
        foreground: cssColor("--foreground"),
        primary: {
          DEFAULT: cssColor("--primary"),
          foreground: cssColor("--primary-foreground"),
        },
        secondary: {
          DEFAULT: cssColor("--secondary"),
          foreground: cssColor("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: cssColor("--destructive"),
          foreground: cssColor("--destructive-foreground"),
        },
        muted: {
          DEFAULT: cssColor("--muted"),
          foreground: cssColor("--muted-foreground"),
        },
        accent: {
          DEFAULT: cssColor("--accent"),
          foreground: cssColor("--accent-foreground"),
        },
        card: {
          DEFAULT: cssColor("--card"),
          foreground: cssColor("--card-foreground"),
        },
        popover: {
          DEFAULT: cssColor("--popover"),
          foreground: cssColor("--popover-foreground"),
        },
        // TailAdmin brand + gray tokens
        brand: {
          25: "#f0fdf4",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        gray: {
          25: "#fcfcfd",
          50: "#f9fafb",
          100: "#f2f4f7",
          200: "#e4e7ec",
          300: "#d0d5dd",
          400: "#98a2b3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1d2939",
          900: "#101828",
          950: "#0c111d",
          dark: "#1a2231",
        },
        success: {
          50: "#ecfdf3",
          500: "#12b76a",
          600: "#039855",
        },
        error: {
          50: "#fef3f2",
          500: "#f04438",
          600: "#d92d20",
        },
      },
      fontSize: {
        "theme-sm": ["14px", { lineHeight: "20px" }],
        "theme-xs": ["12px", { lineHeight: "18px" }],
      },
      boxShadow: {
        "theme-xs": "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        "theme-sm":
          "0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
        "theme-md":
          "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
      },
      zIndex: {
        99999: "99999",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
