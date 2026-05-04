import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Vite builds the React app and emits the image worker as an ES module so the
// worker can use dynamic imports such as the HEIC decoder.
export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
  },
});
