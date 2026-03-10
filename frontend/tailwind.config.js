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
        neo: {
          dark:     '#0A0E14',   // Deepest background
          surface:  '#0F1419',   // Sidebar/panel bg
          card:     '#141B22',   // Card bg
          'card-hover': '#1A2230',
          border:   '#1E2A38',   // Subtle borders
          green:    '#00FF88',   // Neon green accent
          'green-dim': '#00CC6A', // Dimmer green
          text:     '#E8F0FE',   // Primary text
          'text-muted': '#5A7A8A', // Muted text
          'text-dim':   '#3A5468',  // Very dim
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter:    ['Inter', 'sans-serif'],
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
