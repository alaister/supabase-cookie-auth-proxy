module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        text: '#212529',
      },
    },
  },
  plugins: [require('tailwindcss-font-inter'), require('@tailwindcss/forms')],
}
