/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./node_modules/daisyui/dist/**/*.js"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes:  ["light", "dark"],
  }
}

