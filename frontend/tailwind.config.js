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
        primary: {
          DEFAULT: 'var(--eco-primary)',
          light: 'var(--eco-primary)',
          dark: 'var(--eco-primary)',
        },
        secondary: {
          DEFAULT: 'var(--eco-secondary)',
          light: 'var(--eco-secondary)',
          dark: 'var(--eco-secondary)',
        },
        'eco-green': {
          DEFAULT: 'var(--eco-primary)',
          light: 'var(--eco-primary)',
          dark: 'var(--eco-primary)',
        },
        'analytics-blue': {
          DEFAULT: 'var(--analytics-blue)',
          light: 'var(--analytics-blue)',
          dark: 'var(--analytics-blue)',
        },
        background: {
          DEFAULT: 'var(--bg-base)',
          light: 'var(--bg-base)',
          dark: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
        },
        card: {
          DEFAULT: 'var(--bg-card)',
          light: 'var(--bg-card)',
          dark: 'var(--bg-card)',
        },
        text: {
          DEFAULT: 'var(--text)',
          light: 'var(--text)',
          dark: 'var(--text)',
          muted: 'var(--text-muted)',
          dim: 'var(--text-dim)',
        },
        'eco-border': 'var(--border)',
        'eco-surface': 'var(--bg-surface)',
        accent: 'var(--accent)',
        'accent-secondary': 'var(--accent-secondary)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      transitionDuration: {
        '300': '300ms',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':  'float 3s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
