/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: "#201E1F",
        "light-brown": "#E5E0D8",
        "green-accent": "#809671",
        tan: "#725C3A",
      },
      fontFamily: {
        sora: ["var(--font-sora)"],
        righteous: ["var(--font-righteous)"],
      },
    },
  },
  plugins: [],
};
