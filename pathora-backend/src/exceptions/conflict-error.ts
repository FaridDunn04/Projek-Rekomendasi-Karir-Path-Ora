/**
 * exceptions/conflict-error.ts
 *
 * Dilempar ketika operasi gagal karena konflik dengan state resource
 * yang sudah ada (mis. email sudah terdaftar, username sudah dipakai).
 *
 * Dipetakan ke HTTP 409 Conflict (SDD §3.2, FR-001, FR-022).
 */

import { HttpException } from "@/exceptions/base-error";

export class ConflictError extends HttpException {
  constructor(message = "Konflik dengan data yang sudah ada") {
    super(409, message);
  }
}
