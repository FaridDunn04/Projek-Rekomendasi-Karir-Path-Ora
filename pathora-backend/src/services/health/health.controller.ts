/**
 * services/health/health.controller.ts
 *
 * Health check endpoint (FR-025, NFR-010, NFR-022, SDD §3.7.7).
 *
 * Eksekusi SELECT 1 ke database:
 *  - Sukses → 200 { status: 'ok',       db: 'ok',    timestamp }
 *  - Gagal  → 503 { status: 'degraded', db: 'error', timestamp }
 *
 * Endpoint ini TIDAK memerlukan autentikasi.
 */

import type { Request, Response } from "express";
import { pool } from "../../config/database.js";
import { response } from "../../utils/response.js";
import { logger } from "../../config/logger.js";

// ── Types ──────────────────────────────────────────────────────────────────────

interface HealthStatus {
  status: "ok" | "degraded";
  db: "ok" | "error";
  timestamp: string;
}

// ── Controller Function ────────────────────────────────────────────────────────

/**
 * GET /health
 * Mengembalikan status layanan dan koneksi database.
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const timestamp = new Date().toISOString();

  try {
    await pool.query("SELECT 1");

    const status: HealthStatus = { status: "ok", db: "ok", timestamp };
    res.status(200).json(response.success(status));
  } catch (err) {
    logger.error({ err }, "health.check.db_error");

    const status: HealthStatus = { status: "degraded", db: "error", timestamp };
    res.status(503).json(response.success(status));
  }
}
