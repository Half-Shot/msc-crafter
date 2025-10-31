import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  base: process.env.VITE_BASE ?? "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["preact", "@mantine/hooks", "styled-components"],
          parsing: ["markdown-it", "highlight.js"],
          rawparsing: [
            "@wooorm/starry-night",
            "hast-util-to-jsx-runtime",
            "react-markdown",
          ],
        },
      },
    },
  },
});
