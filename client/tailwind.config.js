/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vibe: {
          dark: "#000000",
          muted: "#586F7C",
          accent: "#B8DBD9",
          bg: "#F4F4F9",
          primary: "#04724D"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
