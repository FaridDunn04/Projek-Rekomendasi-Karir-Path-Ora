/**
 * exceptions/not-found-error.ts
 *
 * Dilempar ketika resource yang diminta tidak ditemukan di database.
 *
 * Contoh: CV dengan ID tertentu tidak ada, atau analisis tidak ditemukan.
 *
 * Dipetakan ke HTTP 404 Not Found (SDD §3.2).
 */

import { HttpException } from "@/exceptions/base-error";

export class NotFoundError extends HttpException {
  constructor(message = "Resource tidak ditemukan") {
    super(404, message);
  }
}
