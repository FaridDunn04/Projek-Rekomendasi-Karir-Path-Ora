/**
 * security/token-manager.ts
 *
 * Mengelola pembuatan dan verifikasi JWT (SEC-002, NFR-006, SDD §3.4).
 *
 * Payload minimal: { id, email } — tanpa data sensitif.
 * Secret & expiry diambil dari config (fail-fast saat startup).
 */

import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "@/config";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TokenPayload {
  id: string;
  email: string;
}

// ── Token Manager ──────────────────────────────────────────────────────────────

export const tokenManager = {
  /**
   * Membuat JWT yang ditandatangani dengan JWT_SECRET.
   * Masa berlaku diatur oleh JWT_EXPIRES_IN (default '7d').
   */
  sign(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  },

  /**
   * Memverifikasi JWT dan mengembalikan payload.
   * Melempar JsonWebTokenError / TokenExpiredError bila token tidak valid.
   * Error ini ditangkap oleh `middlewares/auth.ts` dan dikonversi ke AuthenticationError.
   */
  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return {
      id: decoded["id"] as string,
      email: decoded["email"] as string,
    };
  },
};
