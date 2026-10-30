/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#F7F4F8',
          100: '#EFEBF2',
          200: '#DEC9DE',
          300: '#C7A8C8',
          500: '#8A5590',
          700: '#5F3965',
          800: '#422B46', // Deep Plum
          900: '#2E1D31',
        },
        lavender: {
          50: '#F6F3F9',
          100: '#EDE7F3',
          300: '#CBBED9',
          400: '#A995BE', // Muted Lavender
          500: '#8E77A7',
          700: '#644F7A',
        },
        rose: {
          50: '#FDF7F8',
          100: '#F9ECEF',
          200: '#F3D9DE',
          300: '#EACBD0', // Soft Rose
          400: '#DFBAC1',
          500: '#C7909A',
          700: '#94535F',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E5EDE7',
          300: '#ADC4B6',
          400: '#81988C', // Muted Sage
          500: '#657E71',
          700: '#485A51',
        },
        ivory: {
          50: '#FCFBF9',
          100: '#FAF8F5', // Warm Ivory
          200: '#F4EFEA',
          300: '#ECE3DA',
        },
        slate: {
          400: '#758091',
          500: '#5E6877',
          600: '#4D5663', // Slate
          700: '#3D4550',
          800: '#2A3038',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(66, 43, 70, 0.05), 0 1px 2px -1px rgba(66, 43, 70, 0.05)',
        card: '0 4px 6px -1px rgba(66, 43, 70, 0.06), 0 2px 4px -2px rgba(66, 43, 70, 0.04)',
        elevated: '0 10px 15px -3px rgba(66, 43, 70, 0.08), 0 4px 6px -4px rgba(66, 43, 70, 0.04)',
      }
    },
  },
  plugins: [],
}
