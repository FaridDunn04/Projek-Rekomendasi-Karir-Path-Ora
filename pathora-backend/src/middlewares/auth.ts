/**
 * middlewares/auth.ts
 *
 * JWT Guard — melindungi seluruh endpoint privat (FR-004, SEC-002, SDD §3.3).
 *
 * Alur:
 *  1. Ekstrak header Authorization: Bearer <token>
 *  2. Verifikasi token via tokenManager.verify()
 *  3. Set req.user = { id, email } agar tersedia di controller & use-case
 *
 * Bila gagal → lempar AuthenticationError (401) → ditangkap error handler.
 *
 * Prinsip keamanan: identitas pemilik SELALU dari req.user (hasil verifikasi JWT),
 * tidak pernah dari body/query yang dapat dimanipulasi klien (SEC-003, DATA-007).
 */

import type { Request, Response, NextFunction } from "express";
import { tokenManager, type TokenPayload } from "@/security/token-manager";
import { AuthenticationError } from "@/exceptions/authentication-error";

// ── Augment Express Request ────────────────────────────────────────────────────
// Tambahkan properti `user` ke tipe Request agar TypeScript mengenalinya
// di seluruh controller dan use-case.

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// ── Middleware ─────────────────────────────────────────────────────────────────

export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  // Pastikan header ada dan berformat "Bearer <token>"
  if (!header?.startsWith("Bearer ")) {
    return next(new AuthenticationError("Token tidak ditemukan"));
  }

  const token = header.slice(7); // hapus prefix "Bearer "

  try {
    req.user = tokenManager.verify(token);
    next();
  } catch {
    // JsonWebTokenError, TokenExpiredError, NotBeforeError → semua → 401
    next(new AuthenticationError("Token tidak valid atau kedaluwarsa"));
  }
}
