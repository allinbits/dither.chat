import { defineConfig } from 'vite';
import { fileURLToPath, URL } from "node:url";
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
      nodePolyfills({
        // Whether to polyfill specific globals.
        globals: {
          Buffer: true, // can also be 'build', 'dev', or false
          global: true,
          process: true,
        },
      }),
      vue(), 
      tailwindcss(),
    ],
    resolve: {
        alias: {
          "@": fileURLToPath(new URL("./src", import.meta.url)),
          "~": fileURLToPath(new URL("./src", import.meta.url)),
          "api-main/types": fileURLToPath(new URL("../api-main/src/types", import.meta.url)),
        },
    },
});
