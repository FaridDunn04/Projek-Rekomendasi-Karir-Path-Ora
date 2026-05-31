/**
 * exceptions/client-error.ts
 *
 * Dilempar untuk kesalahan input dari klien yang dapat diperbaiki
 * oleh klien itu sendiri (mis. validasi Zod gagal, format tidak valid).
 *
 * Menerima `details` opsional berisi field errors dari Zod
 * (`result.error.flatten().fieldErrors`) agar klien tahu field mana
 * yang bermasalah.
 *
 * Dipetakan ke HTTP 422 Unprocessable Entity (SDD §3.2, SEC-005, VAL-001..006).
 */

import { HttpException } from "./base-error.js";

export class ClientError extends HttpException {
  constructor(message = "Input tidak valid", details?: unknown) {
    super(422, message, details);
  }
}
