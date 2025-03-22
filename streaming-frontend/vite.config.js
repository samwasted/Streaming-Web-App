import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(),  tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173, // Ensure it runs on the expected port
  },
  resolve: {
    alias: {
      "@": "/src", // Optional alias for cleaner imports
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      
    ],
  },
});
