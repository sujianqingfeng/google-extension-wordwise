import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/entries/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "sassy-frass": ["'Sassy Frass'", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "primary-color": "#de7897",
      },
      zIndex: {
        9999: 9999,
        10000: 10000,
      },
      listStyleType: {
        circle: "circle",
      },
    },
  },
  plugins: [],
}
