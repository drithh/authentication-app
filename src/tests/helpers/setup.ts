// src/tests/helpers/setup.ts

import resetDb from "./reset-db";
import { beforeAll, beforeEach } from "vitest";

beforeEach(async () => {
  await resetDb();
});
