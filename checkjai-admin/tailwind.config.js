/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cj-pink': '#fce7f3',
        'cj-accent': '#d44b7d',
      },
      fontFamily: {
        'sarabun': ['Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
