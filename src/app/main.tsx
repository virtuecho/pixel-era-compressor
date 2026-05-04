import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// Vite mounts the React app into the static index.html root element.
const root = document.querySelector("#root");

if (root === null) {
  throw new Error("Unable to find the root application element.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the lightweight PWA service worker only for production builds so
// local development always serves fresh files from Vite.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
