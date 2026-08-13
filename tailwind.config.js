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
        gym: {
          bg: '#0B0F17',        // Ultra dark background
          card: '#151D2A',      // Card surface
          border: '#243044',    // Subtle border
          accent: '#10B981',    // Vibrant emerald accent
          accentHover: '#059669',
          amber: '#F59E0B',     // PR Gold/Amber
          purple: '#8B5CF6',    // Secondary highlight
          danger: '#EF4444',    // Discard / Delete red
          textMuted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
