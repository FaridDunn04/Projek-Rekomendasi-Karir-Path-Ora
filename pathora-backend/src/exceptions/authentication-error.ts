/**
 * exceptions/authentication-error.ts
 *
 * Dilempar ketika identitas pengguna tidak dapat diverifikasi:
 * - Token JWT tidak ada / format salah
 * - Token JWT kedaluwarsa atau tanda tangan tidak valid
 *
 * Dipetakan ke HTTP 401 Unauthorized (SDD §3.2, SEC-002, FR-004).
 */

import { HttpException } from "./base-error";

export class AuthenticationError extends HttpException {
  constructor(message = "Autentikasi diperlukan") {
    super(401, message);
  }
}
