/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for the app
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        pixelYellow: '#ffe066',
        pixelOrange: '#ffae42',
        pixelPurple: '#a259f7',
        pixelBlue: '#3b82f6',
        pixelGreen: '#4ade80',
        pixelRed: '#ef4444',
        pixelGray: '#23272e',
        pixelDark: '#181825',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      fontFamily: {
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        pixel: ["'Press Start 2P'", 'monospace'],
      },
      boxShadow: {
        pixel: '0 0 0 4px #fff, 0 0 0 8px #000',
        glow: '0 0 8px 2px #ffe066',
      },
    },
  },
  plugins: [],
}; 