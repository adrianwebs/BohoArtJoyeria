/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        boho: {
          terracotta: {
            DEFAULT: '#C87D55',
            50: '#FAF2EE',
            100: '#F5E4DB',
            200: '#EBC7B6',
            300: '#E0A88F',
            400: '#D48B68',
            500: '#C87D55',
            600: '#B0653F',
            700: '#8C4D2E',
            800: '#67361E',
            900: '#432111',
          },
          sand: {
            DEFAULT: '#F7EDE2',
            50: '#FCFAF7',
            100: '#FAF6F0',
            200: '#F7EDE2',
            300: '#EFE1D1',
            400: '#E5D0BC',
            500: '#D9BEA4',
          },
          gold: {
            DEFAULT: '#D4A373',
            light: '#E5C49E',
            dark: '#B8860B',
          },
          charcoal: {
            DEFAULT: '#2C2523',
            light: '#4A3E3A',
            muted: '#6E5D57',
            border: '#E8E1DC',
          },
          linen: '#FCFBF9',
          sage: {
            DEFAULT: '#7D9D8B',
            light: '#E2EBE6',
            dark: '#587363',
          },
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(44, 37, 35, 0.05)',
        'card': '0 10px 30px -5px rgba(200, 125, 85, 0.08)',
        'elevated': '0 20px 40px -15px rgba(44, 37, 35, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'heart-pop': 'heartPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'badge-bounce': 'badgeBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0.8' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1.5deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-1.5deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
        badgeBounce: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
