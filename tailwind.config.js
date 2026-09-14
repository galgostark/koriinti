/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#030712', // Ultra dark background
          900: '#0b0f19', // Card & panel surface
          850: '#111827', // Card alternate
          800: '#1f2937', // Borders and dividers
          700: '#374151', // Hover states
          600: '#4b5563', // Muted text
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b', // Brand gold accent
          600: '#d97706',
          700: '#b45309',
        },
        copper: {
          500: '#f97316',
          600: '#ea580c',
        },
        silver: {
          300: '#cbd5e1',
          400: '#94a3b8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Rajdhani', 'Chakra Petch', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
