/// <reference types="vitest" />
import * as path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["./test/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@effect/cli/test": path.join(__dirname, "test"),
      "@effect/cli": path.join(__dirname, "src")
    }
  }
})
