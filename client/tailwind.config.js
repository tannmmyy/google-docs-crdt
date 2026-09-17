/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'docs-blue': '#1a73e8',
        'docs-hover': '#f1f3f4',
        'docs-bg': '#f9fbfd',
        'docs-canvas': '#edf2fa',
        'docs-border': '#dadce0',
        'docs-text': '#202124',
        'docs-secondary': '#5f6368',
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'docs-page': '0 1px 3px 1px rgba(60,64,67,.15), 0 1px 2px 0 rgba(60,64,67,.3)',
      }
    },
  },
  plugins: [],
}
