import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import million from "million/compiler";

const ReactCompilerConfig = {
  target: '19' 
};

export default defineConfig({
  plugins: [
    million.vite({ auto: true }),
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig],
        ],
      },
    })
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