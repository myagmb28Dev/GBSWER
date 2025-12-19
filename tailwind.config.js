/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal': {
          500: '#14b8a6',
        }
      }
    },
  },
  plugins: [],
}
