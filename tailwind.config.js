/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#245C3A',
          50: '#F0F6F2',
          100: '#DDE9E0',
          200: '#BDD4C3',
          300: '#94BA9D',
          400: '#649971',
          500: '#3D774D',
          600: '#245C3A',
          700: '#1B472C',
          800: '#143521',
          900: '#0E2416',
        },
        agri: {
          DEFAULT: '#4F8A52',
          light: '#8CBF66',
          dark: '#3A6B3D',
        },
        harvest: {
          DEFAULT: '#E7B44A',
          light: '#F5CE7A',
          dark: '#B88B27',
        },
        earth: {
          DEFAULT: '#9B6A43',
          light: '#B8855D',
          dark: '#7A4F2E',
        },
        cream: {
          DEFAULT: '#F7F8F2',
          50: '#FDFDFB',
          100: '#F7F8F2',
          200: '#ECEEE3',
          300: '#DCE0CF',
        },
        brand: {
          text: '#202B24',
          muted: '#66736A',
          border: '#E1E7DF',
          error: '#C94B45',
          success: '#2F855A',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(32, 43, 36, 0.05), 0 1px 2px rgba(32, 43, 36, 0.03)',
        card: '0 4px 12px -2px rgba(36, 92, 58, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 28px -4px rgba(36, 92, 58, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        elevation: '0 20px 35px -8px rgba(36, 92, 58, 0.16)',
      }
    },
  },
  plugins: [],
}
