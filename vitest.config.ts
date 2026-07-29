import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";
import path from "path";

// Load .env so API tests can reach the database (DATABASE_URL) from the host.
const envFile = path.join(__dirname, ".env");
const env: Record<string, string> = {};
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=("?)(.*)\2$/);
    if (m) env[m[1]] = m[3];
  }
}

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/api/**/*.test.ts"],
    environment: "node",
    env,
    testTimeout: 30000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
});
