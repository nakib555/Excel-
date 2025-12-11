import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: "https://esm.sh/react@18.3.1",
      "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
      "react-dom": "https://esm.sh/react-dom@18.3.1",
      "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
      "lucide-react": "https://esm.sh/lucide-react@0.344.0",
      mathjs: "https://esm.sh/mathjs@12.4.1",
      clsx: "https://esm.sh/clsx@2.1.0",
      "tailwind-merge": "https://esm.sh/tailwind-merge@2.2.2",
      "framer-motion": "https://esm.sh/framer-motion@11.0.8",
      "@google/genai": "https://esm.sh/@google/genai"
    },
  },
  optimizeDeps: {
    exclude: [
      "react",
      "react-dom",
      "react-dom/client",
      "lucide-react",
      "mathjs",
      "clsx",
      "tailwind-merge",
      "framer-motion",
      "@google/genai"
    ]
  },
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});