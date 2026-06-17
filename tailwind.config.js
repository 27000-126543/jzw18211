/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      colors: {
        brand: {
          50: "#FFF5EE",
          100: "#FFE8D6",
          200: "#FFD1AD",
          300: "#FFB584",
          400: "#FF9E5D",
          500: "#FF8C42",
          600: "#E5702A",
          700: "#C05820",
          800: "#99451B",
          900: "#7A3818",
        },
        forest: {
          50: "#F0F6F2",
          100: "#D9E8DF",
          200: "#B2D2BF",
          300: "#84B699",
          400: "#5A9775",
          500: "#2D6A4F",
          600: "#245440",
          700: "#1D4234",
          800: "#17342A",
          900: "#112720",
        },
        cream: {
          50: "#FFFBF6",
          100: "#FFF8F0",
          200: "#FFF0DD",
          300: "#FFE4C2",
        },
        petal: {
          50: "#FFF5F0",
          100: "#FFE8DC",
          200: "#FFD6BA",
          300: "#FFBC91",
        },
      },
      fontFamily: {
        display: ['Poppins', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        sans: ['Noto Sans SC', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 24px -8px rgba(0, 0, 0, 0.08)',
        'card': '0 8px 32px -12px rgba(0, 0, 0, 0.12)',
        'float': '0 16px 48px -16px rgba(255, 140, 66, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
