import path from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        typescript: {
          tsconfigFile: "./tsconfig.svelte.json",
        },
      }),
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, "assets", "script"),
    lib: {
      formats: ["es"],
      entry: path.resolve(__dirname, "src", "svelte", "index.ts"),
      fileName: (format) => "index.js",
    },
  },
});
