/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        mist: "#d9f6ff",
        signal: "#22c55e",
        warning: "#f97316",
        danger: "#ef4444",
        gold: "#fbbf24",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(13, 148, 136, 0.2)",
      },
    },
  },
  plugins: [],
};
