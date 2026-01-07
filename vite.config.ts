import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import million from "million/compiler";

export default defineConfig({
  plugins: [
    million.vite({ auto: true }),
    react()
  ],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve("./"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});