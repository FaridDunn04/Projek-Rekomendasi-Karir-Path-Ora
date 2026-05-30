/**
 * exceptions/base-error.ts
 *
 * Kelas dasar untuk seluruh error domain aplikasi.
 * Setiap error yang dilempar dari use-case atau middleware harus
 * merupakan turunan dari HttpException agar error handler terpusat
 * (`middlewares/error.ts`) dapat memetakannya ke HTTP status code
 * yang tepat (SDD §3.2, NFR-021).
 */

export class HttpException extends Error {
  constructor(
    /** HTTP status code yang akan dikembalikan ke klien */
    public readonly statusCode: number,
    message: string,
    /** Detail tambahan (mis. field errors dari Zod) — opsional */
    public readonly details?: unknown,
  ) {
    super(message);

    // Pastikan nama kelas turunan muncul di stack trace
    this.name = new.target.name;

    // Perbaiki prototype chain agar `instanceof` bekerja dengan benar
    // setelah transpilasi TypeScript ke ES5
    Object.setPrototypeOf(this, new.target.prototype);

    // Potong stack trace agar tidak menyertakan konstruktor ini
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}
