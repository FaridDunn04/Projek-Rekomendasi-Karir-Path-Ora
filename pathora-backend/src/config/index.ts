/**
 * config/index.ts
 *
 * Memuat dan memvalidasi seluruh environment variable saat startup (fail-fast).
 * Bila ada variabel wajib yang kurang atau format salah, proses berhenti
 * sebelum menerima request apapun (SEC-010, NFR-016, SDD §3.1).
 *
 * Koneksi database menggunakan DATABASE_URL (connection string lengkap),
 * sesuai SDD §3.1 dan §9.1 — pg.Pool menerima connectionString secara langsung.
 *
 * Gunakan `config` sebagai satu-satunya sumber kebenaran konfigurasi di seluruh app.
 */

import { z } from "zod";
import dotenv from "dotenv";

// Muat .env sebelum validasi (hanya di non-production; production pakai env vars platform)
dotenv.config();

// ── Schema Validasi ────────────────────────────────────────────────────────────

const EnvSchema = z
  .object({
    // Server
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),

    // Database — connection string lengkap (SDD §3.1, §9.1)
    // Format: postgresql://user:password@host:port/database
    DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),

    // JWT (SEC-002, NFR-006)
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET minimal 32 karakter untuk keamanan"),
    JWT_EXPIRES_IN: z.string().default("7d"),

    // AI Gateway (FR-013, FR-015, BTS-03)
    AI_BASE_URL: z.string().optional(),
    AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
    USE_MOCK_AI: z.coerce.boolean().default(false),

    // CORS (SEC-007)
    ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),

    // Upload (VAL-004)
    MAX_FILE_SIZE_MB: z.coerce.number().positive().default(5),

    // Rate Limiting (SEC-008, NFR-008)
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    STRICT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

    // Logging (NFR-022)
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
  })
  // AI_BASE_URL wajib bila USE_MOCK_AI=false
  .refine((c) => c.USE_MOCK_AI || !!c.AI_BASE_URL, {
    message:
      "AI_BASE_URL wajib diisi bila USE_MOCK_AI=false. " +
      "Set USE_MOCK_AI=true untuk mode development tanpa layanan AI.",
    path: ["AI_BASE_URL"],
  });

// ── Parse & Fail-Fast ──────────────────────────────────────────────────────────

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "[CONFIG] ❌ Environment variable tidak valid. Server tidak dapat dimulai.\n",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  process.exit(1);
}

const env = parsed.data;

// ── Export Config ──────────────────────────────────────────────────────────────

/**
 * Objek konfigurasi terpusat yang sudah divalidasi.
 * Seluruh modul harus mengimpor dari sini, bukan dari `process.env` langsung.
 */
export const config = {
  // Server
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  IS_PRODUCTION: env.NODE_ENV === "production",
  IS_TEST: env.NODE_ENV === "test",

  // Database — connection string langsung ke pg.Pool (SDD §3.1)
  DATABASE_URL: env.DATABASE_URL,

  // JWT
  JWT_SECRET: env.JWT_SECRET,
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,

  // AI Gateway
  AI_BASE_URL: env.AI_BASE_URL,
  AI_TIMEOUT_MS: env.AI_TIMEOUT_MS,
  USE_MOCK_AI: env.USE_MOCK_AI,

  // CORS — diparse dari string comma-separated ke array
  ALLOWED_ORIGINS: env.ALLOWED_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // Upload
  MAX_FILE_SIZE_BYTES: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  MAX_FILE_SIZE_MB: env.MAX_FILE_SIZE_MB,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: env.RATE_LIMIT_MAX,
  STRICT_RATE_LIMIT_MAX: env.STRICT_RATE_LIMIT_MAX,

  // Logging
  LOG_LEVEL: env.LOG_LEVEL,
} as const;

export type Config = typeof config;
