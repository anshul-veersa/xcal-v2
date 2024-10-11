import vue from "@vitejs/plugin-vue2";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
