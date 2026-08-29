/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f59e0b', // amber-500
          dark: '#fbbf24', // amber-400
        }
      }
    },
  },
  plugins: [],
};

export default config;
