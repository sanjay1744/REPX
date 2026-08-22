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
          bg: '#08080C',        // Pure Matte Black / Dark Void
          card: 'rgba(18, 18, 22, 0.85)', // Matte dark glass
          cardBorder: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.1)',
          accent: '#FFFFFF',    // Strict Pure White Accent
          accentHover: '#E4E4E7',
          textMuted: '#71717A'
        }
      },
      boxShadow: {
        'glass-sm': '0 4px 20px -2px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.8), inset 0 1px 2px 0 rgba(255, 255, 255, 0.12)',
        'white-glow': '0 0 20px -2px rgba(255, 255, 255, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}



