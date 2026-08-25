import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    sourcemap: true,
  },
  server: {
    strictPort: true,
  },
  test: {
    // The 12MP CPU evidence must not compete with six other worker files.
    fileParallelism: false,
  },
});
