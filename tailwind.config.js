/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
        "5xl": "3440px",
        "360px": "360px",
        "380px": "380px",
        "430px": "430px",
      },
      gridTemplateColumns: {
        42: "repeat(42, minmax(0, 1fr))",
        25: "repeat(25, minmax(0, 1fr))",
        20: "repeat(20, minmax(0, 1fr))",
        16: "repeat(16, minmax(0, 1fr))",
        14: "repeat(14, minmax(0, 1fr))",
      },
      gridTemplateRows: {
        42: "repeat(42, minmax(0, 1fr))",
        25: "repeat(25, minmax(0, 1fr))",
        20: "repeat(20, minmax(0, 1fr))",
        16: "repeat(16, minmax(0, 1fr))",
        14: "repeat(14, minmax(0, 1fr))",
        12: "repeat(12, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern:
        /from-(red|green|yellow|gray|blue|orange|purple)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern:
        /to-(red|green|yellow|gray|blue|orange|purple)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern:
        /border-(red|green|yellow|gray|blue|orange|purple)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /grid-cols-(3|4|5|6|7|8|9|10|11|12)/,
    },
  ],
};
