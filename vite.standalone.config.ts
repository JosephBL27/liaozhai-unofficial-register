import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

function markStandaloneDocument(): Plugin {
  return {
    name: "liaozhai-standalone-document",
    enforce: "post",
    transformIndexHtml(html) {
      return html.replace("<html lang=\"en\">", "<html lang=\"en\" data-standalone=\"true\">");
    },
  };
}

export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [
    react(),
    markStandaloneDocument(),
    viteSingleFile({ removeViteModuleLoader: true }),
  ],
  build: {
    outDir: "standalone",
    emptyOutDir: true,
  },
});
