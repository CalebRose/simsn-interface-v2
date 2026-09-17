import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const apiUrl = loadEnv(mode, process.cwd(), "VITE_").VITE_SIMLAX_API_URL?.trim();
    if (!apiUrl) {
      throw new Error("VITE_SIMLAX_API_URL is required for a production build.");
    }

    let url;
    try {
      url = new URL(apiUrl);
    } catch {
      throw new Error("VITE_SIMLAX_API_URL must be an absolute HTTPS URL.");
    }

    const hostname = url.hostname.toLowerCase();
    const isPrivateAddress = /^(?:localhost|.*\.localhost|0\.0\.0\.0|127\..*|10\..*|192\.168\..*|169\.254\..*|172\.(?:1[6-9]|2\d|3[01])\..*|\[?::1\]?)$/.test(hostname);
    if (url.protocol !== "https:" || isPrivateAddress) {
      throw new Error("VITE_SIMLAX_API_URL must point to a public HTTPS API, not a local address.");
    }
  }

  return {
    base: "/",
    plugins: [react()],
  };
});
