/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/styles/**/*.css', // Tambahkan jika CSS ada di folder styles
  ],
  theme: {
    extend: {
      colors: {
        'sfc-gold': '#DDA853',
        'sfc-dark-blue': '#183B4E',
        'sfc-mid-blue': '#27548A',
        'sfc-cream': '#F3F3E0',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};