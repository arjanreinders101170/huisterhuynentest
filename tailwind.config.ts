import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#EAE3D2",
        "sand-light": "#F2EDE3",
        "sand-dark": "#D4CABB",
        lodge: {
          green: "#2F4F3E",
          "green-light": "#3A6350",
        },
        gold: "#B49A5E",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
