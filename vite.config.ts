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
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (_proxyReq, req) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
      "/ws": {
        target: "https://api-nav.dimansoft.ir",
        changeOrigin: true,
        secure: true,
        ws: true, // Enable WebSocket proxy
        cookieDomainRewrite: "",
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("WebSocket proxy error", err);
          });
          proxy.on("proxyReqWs", (_proxyReq, req) => {
            console.log("WebSocket Request to the Target:", req.url);
          });
        },
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
