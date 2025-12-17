module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F6E7A8',
        'primary-dark': '#E7D37D',
        background: '#FDFBF3',
        card: '#FFFFFF',
        text: '#6A4B1F',
        accent: '#C89B3C',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 14px 30px rgba(119, 90, 40, 0.12)',
      },
    },
  },
  plugins: [],
}
