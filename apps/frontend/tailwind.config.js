/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      keyframes: {
        appear: {
          from: {
            opacity: '0',
            transform: 'scale(0.4)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      animation: {
        appear: 'appear 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
