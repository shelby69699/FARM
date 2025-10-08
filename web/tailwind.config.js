/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'farm-cyan': '#00D9FF',
        'farm-pink': '#FF3366',
        'farm-purple': '#9333EA',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

