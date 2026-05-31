/**
 * exceptions/authorization-error.ts
 *
 * Dilempar ketika pengguna sudah terautentikasi tetapi tidak memiliki
 * hak akses terhadap resource yang diminta (ownership check gagal).
 *
 * Contoh: mencoba mengakses CV atau analisis milik pengguna lain.
 *
 * Dipetakan ke HTTP 403 Forbidden (SDD §3.2, SEC-003, FR-012).
 */

import { HttpException } from "./base-error.js";

export class AuthorizationError extends HttpException {
  constructor(message = "Akses ditolak") {
    super(403, message);
  }
}
