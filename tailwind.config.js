/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/entries/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': '#de7897'
      },
      zIndex: {
        9999: 9999
      }
    }
  },
  plugins: []
}
