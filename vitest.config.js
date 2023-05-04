import { join } from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    testTimeout: 20000,
    setupFiles: ["src/tests/helpers/setup.ts"],
    include: ["src/**/*.test.ts", "!src/tests"],
    reporters: ["verbose"],
    coverage: {
      provider: "c8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "~/": join(__dirname, "./src/"),
    },
  },
});
