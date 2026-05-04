import { defineConfig } from "vitest/config";

// Unit tests run in Node and use tiny synthetic frames/blobs, keeping imaging
// math deterministic without launching a browser.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/tests/**/*.test.ts"],
  },
});
