import { defineConfig } from "@playwright/test";

export default defineConfig({ testDir: "./tests", testMatch: "**/*.visual.ts", use: { baseURL: "http://127.0.0.1:4173" }, workers: 1 });
