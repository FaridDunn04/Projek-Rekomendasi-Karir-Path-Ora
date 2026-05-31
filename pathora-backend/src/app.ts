/**
 * src/app.ts
 *
 * Express app factory — membuat dan mengkonfigurasi instance Express
 * tanpa memulai server (agar mudah di-test dengan Supertest, SDD §2.2).
 *
 * Urutan middleware (penting):
 *  1. CORS                  — harus sebelum semua route
 *  2. JSON body parser      — parse application/json
 *  3. Request ID            — correlation ID untuk logging (NFR-022)
 *  4. Global rate limiter   — sebelum route (SEC-008)
 *  5. API routes (/api/v1)  — semua domain router
 *  6. 404 handler           — route tidak ditemukan
 *  7. Error handler         — harus TERAKHIR (NFR-021)
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { nanoid } from "nanoid";
import { corsMiddleware } from "./middlewares/cors";
import { globalLimiter } from "./middlewares/rate-limit";
import { errorHandler } from "./middlewares/error";
import { response } from "./utils/response";
import apiRouter from "./routes/index";

// ── App Factory ────────────────────────────────────────────────────────────────

export function createApp() {
  const app = express();

  // 1. CORS (SEC-007)
  app.use(corsMiddleware);

  // 2. JSON body parser
  app.use(express.json({ limit: "10mb" }));

  // 3. Request ID — correlation ID per request untuk logging (NFR-022)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as Request & { id: string }).id = nanoid(10);
    next();
  });

  // 4. Global rate limiter (SEC-008)
  app.use(globalLimiter);

  // 5. API routes
  app.use("/api/v1", apiRouter);

  // 6. 404 — route tidak ditemukan
  app.use((_req: Request, res: Response) => {
    res.status(404).json(response.error("Endpoint tidak ditemukan"));
  });

  // 7. Global error handler — HARUS TERAKHIR (NFR-021)
  app.use(errorHandler);

  return app;
}
