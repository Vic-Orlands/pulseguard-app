export const barebonesBoxedTailwindConfig = {
  theme: {
    extend: {
      colors: {
        bg: {
          1: "#f3f4f6", // Page outer background (gray-100)
          2: "#ffffff", // Panel container background (white)
          3: "#f9fafb", // Light gray accent (gray-50)
        },
        border: "#e4e4e7", // Border color (zinc-200)
        text: {
          primary: "#14171e", // Primary text (slate-900)
          secondary: "#43454b", // Secondary text (gray-700)
          muted: "#7b7d81", // Muted text (gray-500)
        },
        primary: {
          DEFAULT: "#14171e", // Primary action button (slate-900)
          foreground: "#ffffff",
        },
      },
    },
  },
};
