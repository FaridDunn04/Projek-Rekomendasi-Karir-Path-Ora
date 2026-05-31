/**
 * exceptions/invariant-error.ts
 *
 * Dilempar ketika sebuah assertion domain gagal — kondisi yang
 * seharusnya tidak terjadi jika input valid, tetapi perlu dijaga
 * sebagai lapisan pertahanan tambahan di use-case layer.
 *
 * Berbeda dari ClientError yang berasal dari validasi input,
 * InvariantError berasal dari pelanggaran aturan bisnis internal.
 *
 * Contoh: respons AI tidak sesuai schema yang diharapkan.
 *
 * Dipetakan ke HTTP 422 Unprocessable Entity (SDD §3.2, VAL-007).
 */

import { HttpException } from "./base-error";

export class InvariantError extends HttpException {
  constructor(message = "Kondisi tidak terpenuhi", details?: unknown) {
    super(422, message, details);
  }
}
