/**
 * vite.config.ts — build/dev configuration.
 * Port 8000 (strict) matches the old app's origin (http://localhost:8000), so
 * the new app reads the same localStorage key without any migration.
 */
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tailwindcss()],
  server: { port: 8000, strictPort: true },
  preview: { port: 8000, strictPort: true },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
