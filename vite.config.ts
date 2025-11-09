import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    // Optimize for production
    cssMinify: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        // Add cache-busting for assets
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
    // Enable long-term caching for chunks
    chunkSizeWarningLimit: 1000,
  },
  // Configure development server
  server: {
    port: 5173,
    host: true,
  },
});
