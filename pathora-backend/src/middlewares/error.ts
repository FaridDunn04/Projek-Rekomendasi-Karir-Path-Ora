/**
 * middlewares/error.ts
 *
 * Global error handler terpusat (NFR-021, SDD §3.3, §7.1).
 *
 * Harus dipasang TERAKHIR di app.ts setelah semua route.
 * Express mengenali error handler dari 4 parameter: (err, req, res, next).
 *
 * Strategi:
 *  - HttpException (known error) → gunakan statusCode + pesan dari exception
 *  - Error lain (unknown)        → log penuh + kembalikan 500 generik
 *    (stack trace TIDAK bocor ke klien — SEC)
 */

import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../exceptions/base-error";
import { response } from "../utils/response";
import { logger } from "../config/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // ── Known error (domain exception) ──────────────────────────────────────────
  if (err instanceof HttpException) {
    res.status(err.statusCode).json(response.error(err.message, err.details));
    return;
  }

  // ── Unknown error (bug, library error, dsb.) ─────────────────────────────────
  // Log penuh dengan stack trace untuk debugging, tapi jangan bocorkan ke klien
  logger.error(
    {
      err,
      reqId: (req as Request & { id?: string }).id,
      method: req.method,
      url: req.originalUrl,
    },
    "unhandled.error",
  );

  res.status(500).json(response.error("Terjadi kesalahan pada server"));
}
