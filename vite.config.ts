import { crx } from "@crxjs/vite-plugin";
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from "vite";
import manifest from "./src/manifest.config";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte(), crx({ manifest })],
    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            clientPort: 5173,
        },
    },
    build: {
      rollupOptions: {
        input: {
          sidepanel: 'src/pages/sidepanel/index.html'
        },
        
        
      }
      
    },
    resolve: {
      alias: {
        $lib: path.resolve("./src/lib"),
      },
    },
});
