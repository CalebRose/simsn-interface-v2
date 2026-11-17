import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const requirePublicHttps = (name, apiUrl) => {
      let url;
      try {
        url = new URL(apiUrl);
      } catch {
        throw new Error(`${name} must be an absolute HTTPS URL.`);
      }

      const hostname = url.hostname.toLowerCase();
      const isPrivateAddress = /^(?:localhost|.*\.localhost|0\.0\.0\.0|127\..*|10\..*|192\.168\..*|169\.254\..*|172\.(?:1[6-9]|2\d|3[01])\..*|\[?::1\]?)$/.test(hostname);
      if (url.protocol !== "https:" || isPrivateAddress) {
        throw new Error(`${name} must point to a public HTTPS API, not a local address.`);
      }
    };

    const laxApiUrl = env.VITE_SIMLAX_API_URL?.trim();
    if (!laxApiUrl) {
      throw new Error("VITE_SIMLAX_API_URL is required for a production build.");
    }
    requirePublicHttps("VITE_SIMLAX_API_URL", laxApiUrl);
    // Volleyball's API address is in src/_constants/urls.tsx, not the env.
  }

  return {
    base: "/",
    plugins: [react()],
    // Keep the dev server from crawling the nested worktree and tool folders.
    optimizeDeps: { entries: ["index.html"] },
    // The SimCLAX API only allows CORS from localhost:5173, so never fall back to another port.
    server: { port: 5173, strictPort: true, watch: { ignored: ["**/.worktrees/**", "**/tools/**", "**/teasers/**"] } },
  };
});
