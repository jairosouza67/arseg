import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// VitePWA DISABLED - Was causing conflicts with Supabase requests
// import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // VitePWA DISABLED - Service Worker was intercepting Supabase requests
    // and causing timeouts. Re-enable only after proper Supabase exclusion is configured.
    // VitePWA({
    //   registerType: "autoUpdate",
    //   ...
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts']
  }
}));

