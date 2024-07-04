module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      primary: 'Dancing+Script',
    },

    screens: {
      sm: '640px',
      md: '768px',
      lg: '960px',
      xl: '1200px',
    },
    extend: {
      colors: {
        main: '#544125',
      },
    },
    backgroundImage: {
      site: "url('./assets/weddingbg.jpg')",
    },
  },
  plugins: [],
};
