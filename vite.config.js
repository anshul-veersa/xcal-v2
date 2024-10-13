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
  envPrefix: "CLIENT_",
});
