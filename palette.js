/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F52BA',    // Trust Blue
          secondary: '#10B981',  // Health Green
          accent: '#6366F1',     // Modern Indigo
          surface: '#F8FAFC',    // Anti-flash White
          text: '#1E293B'        // Slate Gray
        }
      }
    },
  },
  plugins: [],
}