import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    esbuild: {
      pure:
        command === "build"
          ? ["console.log", "console.debug", "console.info"]
          : [],
    },

    build: {
      sourcemap: false,
    },

    server: {
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE || "http://localhost:4000",
          changeOrigin: true,
          secure: (env.VITE_API_BASE || "").startsWith("https"),
        },
      },
    },
  };
});
