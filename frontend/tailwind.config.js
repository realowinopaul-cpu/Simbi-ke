module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'simbi-gold': '#F4C430',
        'simbi-green': '#006600',
        'simbi-black': '#1A1A1A',
        'simbi-red': '#CC0000',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
