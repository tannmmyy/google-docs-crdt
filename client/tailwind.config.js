/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'glass-dark': 'rgba(18, 10, 16, 0.72)',
        'glass-card': 'rgba(35, 18, 28, 0.65)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
        'glass-hover': 'rgba(255, 255, 255, 0.08)',
        'glass-active': 'rgba(244, 63, 94, 0.2)',
        'accent-rose': '#f43f5e',
        'accent-pink': '#fb7185',
        'docs-blue': '#1a73e8',
        'docs-hover': '#f1f3f4',
        'docs-bg': '#f9fbfd',
        'docs-canvas': '#edf2fa',
        'docs-border': '#dadce0',
        'docs-text': '#202124',
        'docs-secondary': '#5f6368',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glass-pill': '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        'glass-glow': '0 0 30px rgba(244, 63, 94, 0.25)',
        'docs-page': '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
