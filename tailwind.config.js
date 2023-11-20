/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        mainCard: "0px 10px 0px 0px #000",
        redCircle: "0px 5px 0px 0px #000",
      },
      fontFamily: {
        main: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
