// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/fiches": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/conversations": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/questions": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    }
  },
  build: {
    rollupOptions: {
      external: ["@supabase/supabase-js"]
    }
  }
});
