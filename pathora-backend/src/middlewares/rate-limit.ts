/**
 * middlewares/rate-limit.ts
 *
 * Rate limiting untuk mencegah brute-force dan penyalahgunaan endpoint
 * (SEC-008, NFR-008, SDD §3.3, §6.4).
 *
 * Dua instance limiter:
 *
 *  globalLimiter  — dipasang di app.ts untuk seluruh endpoint
 *                   (default: 100 req / 15 menit)
 *
 *  strictLimiter  — dipasang per-route pada endpoint sensitif:
 *                   POST /auth/login, POST /auth/register,
 *                   POST /cvs/:cvId/analyze
 *                   (default: 10 req / 15 menit)
 *
 * Respons 429 mengikuti format konsisten { data, error, meta } (NFR-021).
 */

import rateLimit, { type Options } from "express-rate-limit";
import type { Request, Response } from "express";
import { config } from "@/config";
import { response } from "@/utils/response";

// ── Handler 429 ────────────────────────────────────────────────────────────────

const tooManyRequestsHandler: Options["handler"] = (
  _req: Request,
  res: Response,
) => {
  res
    .status(429)
    .json(response.error("Terlalu banyak permintaan, coba lagi nanti"));
};

// ── Global Limiter ─────────────────────────────────────────────────────────────

/**
 * Dipasang di app.ts sebelum router.
 * Melindungi seluruh endpoint dari request berlebihan.
 */
export const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true, // kirim header RateLimit-* (RFC 6585)
  legacyHeaders: false,
  handler: tooManyRequestsHandler,
});

// ── Strict Limiter ─────────────────────────────────────────────────────────────

/**
 * Dipasang per-route pada endpoint sensitif.
 * Lebih ketat untuk mencegah brute-force kredensial dan abuse endpoint AI.
 */
export const strictLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.STRICT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequestsHandler,
});
