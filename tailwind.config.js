/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4f0',
          100: '#ffe0d5',
          200: '#ffbba3',
          300: '#ff9070',
          400: '#f26744',
          500: '#e85530', // primary orange
          600: '#d44522',
          700: '#b03618',
          800: '#8c2810',
          900: '#6b1d0b',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};