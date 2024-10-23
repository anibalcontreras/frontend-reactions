// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#f15f51',
        // 'primary-blue': '#1915d1',
        // // 'primary-base': '#1915d1',
        // // 'primary-hover': '#120f93',
        // // 'primary-text': '#f1f4ff',
        'primary-base': '#1915d1',
        'primary-hover': '#120f93',
        'primary-text': '#f1f4ff',
      },
    },
  },
  plugins: [],
};