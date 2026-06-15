/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#e6fcfb',
          100: '#ccf7f4',
          200: '#99eee9',
          300: '#66e6de',
          400: '#33ddd3',
          500: '#00a19b',
          600: '#008b85',
          700: '#007a75',
          800: '#00514e',
          900: '#00312f',
        },
        orange: {
          50:  '#e6fcfb',
          100: '#ccf7f4',
          200: '#99eee9',
          300: '#66e6de',
          400: '#33ddd3',
          500: '#00a19b',
          600: '#008b85',
          700: '#007a75',
          800: '#00514e',
          900: '#00312f',
        },
        rose: {
          50:  '#e6fcfb',
          100: '#ccf7f4',
          200: '#99eee9',
          300: '#66e6de',
          400: '#33ddd3',
          500: '#007a75',
          600: '#00514e',
          700: '#00312f',
        },
        dark: {
          900: '#E4DDD3',
          800: '#DCD5CB',
          700: '#CFC8BE',
          600: '#C0B9AE',
          500: '#B0A99E',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.7s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #E4DDD3 0%, #DCD5CB 50%, #CFC8BE 100%)',
        'orange-gradient': 'linear-gradient(135deg, #00A19B, #008b85)',
        'card-gradient': 'linear-gradient(135deg, rgba(0,161,155,0.05), rgba(0,161,155,0.02))',
      },
    },
  },
  plugins: [],
}
