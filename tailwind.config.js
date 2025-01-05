/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "400px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      boxShadow: {
        mainCard: "0px 10px 0px 0px #000",
        redCircle: "0px 5px 0px 0px #000",
      },
      fontFamily: {
        main: ["Space Grotesk", "sans-serif"],
      },
      keyframes: {
        "winner-announcement": {
          "0%": {
            transform: "scale(0.3) translateY(100px)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.2) translateY(0)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(1) translateY(0)",
            opacity: "1",
          },
        },
        "winning-counter": {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.1)", filter: "brightness(1.2)" },
        },
      },
      animation: {
        "winner-announcement":
          "winner-announcement 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "winning-counter": "winning-counter 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
