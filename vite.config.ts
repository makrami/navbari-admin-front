import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api-nav.dimansoft.ir",
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: "",
      },
      "/ws": {
        target: "https://api-nav.dimansoft.ir",
        changeOrigin: true,
        secure: true,
        ws: true, // Enable WebSocket proxy
        cookieDomainRewrite: "",
      },
      "/socket.io": {
        target: "https://api-nav.dimansoft.ir",
        changeOrigin: true,
        secure: true,
        ws: true,
        cookieDomainRewrite: "",
      },
    },
  },
});
