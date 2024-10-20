import vue from "@vitejs/plugin-vue2";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".vue", ".js", ".json"],
  },
  server: {
    port: 4000,
    host: "0.0.0.0",
  },
  build: {
    copyPublicDir: false,
    rollupOptions: {
      external: ["vue"],
      output: {
        // disable warning on src/index.ts using both default and named export
        exports: "named",
        // Provide global variables to use in the UMD build
        // for externalized deps (not useful if 'umd' is not in lib.formats)
        globals: {
          vue: "Vue",
        },
      },
    },
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "xcal-v2",
      formats: ["es"],
      fileName: (format) => `xcal-v2.${format}.js`,
    },
  },
});
