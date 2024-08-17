import path from "path"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  publicDir: "public",
  plugins: [
    tsconfigPaths({
      root: path.resolve(__dirname, "."),
      projects: ["./tsconfig.json"],
    }),
  ],
  server: {
    port: 2000,
  },
})
