/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coke-red': '#F40009',
        'coke-dark': '#1a1a1a',
      }
    },
  },
  plugins: [],
}

