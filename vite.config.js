import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// export default defineConfig({
//   base: "/simsn-interface-v2/",
//   plugins: [react()],
// });

export default defineConfig({
  base: "/simsn-interface-v2/",
  plugins: [react()],
  build: {
    target: ["es2015", "safari11"],
  },
});
