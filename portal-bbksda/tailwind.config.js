export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#386641',
        'brand-green-light': '#6A994E',
        'brand-accent': '#A7C957',
        'brand-brown': '#A77B0E',
        'brand-bg': '#F7F9F9',
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}