/**
 * middlewares/cors.ts
 *
 * Konfigurasi CORS berdasarkan ALLOWED_ORIGINS dari config (SEC-007, SDD §3.3).
 *
 * Origin yang tidak ada di daftar akan ditolak otomatis oleh library cors.
 * credentials: true diperlukan agar browser mengirim cookie/Authorization header
 * pada cross-origin request.
 */

import cors from "cors";
import { config } from "../config/index.js";

export const corsMiddleware = cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
