import { join } from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    testTimeout: 10000,
    setupFiles: ["src/tests/helpers/setup.ts"],
    include: ["src/**/*.test.ts", "!src/tests"],
  },
  resolve: {
    alias: {
      "~/": join(__dirname, "./src/"),
    },
  },
});
