/**
 * middlewares/validate.ts
 *
 * Factory middleware validasi input menggunakan Zod (SEC-005, VAL-001..006, SDD §3.3).
 *
 * Penggunaan:
 *   router.post('/register', validate(RegisterSchema, 'body'), controller.register)
 *   router.get('/:cvId',     validate(CvIdParamSchema, 'params'), controller.getOne)
 *   router.get('/',          validate(PaginationSchema, 'query'), controller.list)
 *
 * Bila validasi gagal → lempar ClientError(422) dengan details berisi field errors.
 * Bila sukses → req[source] ditimpa dengan data ter-parse (ter-coerce & ter-trim).
 */

import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ClientError } from "@/exceptions/client-error";

type ValidationSource = "body" | "params" | "query";

/**
 * Membuat middleware validasi Zod untuk source tertentu.
 *
 * @param schema  - Zod schema yang digunakan untuk validasi
 * @param source  - Bagian request yang divalidasi: 'body' | 'params' | 'query'
 */
export function validate(schema: ZodSchema, source: ValidationSource = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(
        new ClientError("Validasi gagal", result.error.flatten().fieldErrors),
      );
    }

    // Timpa dengan data ter-parse agar coercion & default Zod diterapkan
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}
