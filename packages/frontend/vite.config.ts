import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

if (!process.env.VITE_BACKEND_URL) {
  throw Error('No VITE_BACKEND_URL env var provided. This is needed for auth to work');
} else if (!URL.canParse(process.env.VITE_BACKEND_URL)) {
  throw Error('VITE_BACKEND_URL is not a valid URL');
}

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
