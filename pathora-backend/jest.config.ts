/**
 * jest.config.ts
 *
 * Konfigurasi Jest untuk unit test dan integration test (SDD §8.1).
 * Menggunakan ts-jest dengan tsconfig.test.json yang mengaktifkan Jest globals.
 */

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Resolve path alias @/* → src/*
  // Dua aturan:
  //  1. Strip ekstensi .js  → import '@/foo.js'  menjadi src/foo
  //  2. Tanpa ekstensi      → import '@/foo'     menjadi src/foo
  // ts-jest akan mencari src/foo.ts secara otomatis
  moduleNameMapper: {
    // Mock nanoid (ESM-only v5) dengan implementasi CJS sederhana
    "^nanoid$": "<rootDir>/tests/__mocks__/nanoid.ts",
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Ekstensi file yang dikenali — urutan penting: .ts lebih dulu
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Pattern file test
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.spec.ts"],

  // Set env vars SEBELUM modul di-import (config validasi env saat import)
  setupFiles: ["<rootDir>/tests/setup-env.ts"],

  // Tutup pool DB setelah semua test selesai (satu kali, bukan per file)
  globalTeardown: "<rootDir>/tests/global-teardown.ts",

  // ts-jest: gunakan tsconfig khusus test yang mengaktifkan Jest globals
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.test.json",
        // Matikan diagnostics TypeScript saat runtime Jest
        // (error TS ditangani oleh IDE/build, bukan saat test run)
        diagnostics: {
          ignoreCodes: ["TS151001"],
        },
      },
    ],
  },

  // Coverage
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // Timeout per test (ms)
  testTimeout: 30_000,

  verbose: true,
};

export default config;
