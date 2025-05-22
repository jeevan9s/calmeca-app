/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/rsrc/**/*.{js,jsx,ts,tsx}', // add this path to include your UI code
    // also add other paths if needed, e.g.:
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
