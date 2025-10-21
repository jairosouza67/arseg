import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "ARSEG Extintores - Segurança e Proteção",
        short_name: "ARSEG",
        description: "Sistema completo de gestão e venda de extintores de incêndio",
        theme_color: "#E63946",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/Imagem do WhatsApp de 2025-10-21 à(s) 15.52.42_6e8d4403.jpg",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "/Imagem do WhatsApp de 2025-10-21 à(s) 15.52.42_6e8d4403.jpg",
            sizes: "512x512",
            type: "image/jpeg",
          },
          {
            src: "/Imagem do WhatsApp de 2025-10-21 à(s) 15.52.42_6e8d4403.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
