/**
 * src/server.ts
 *
 * Entry point aplikasi — startup & graceful shutdown (SDD §2.2, §7.3, NFR-010).
 *
 * Urutan startup (fail-fast):
 *  1. Import config  → validasi env (Zod); gagal → process.exit(1)
 *  2. Test koneksi DB → SELECT 1; gagal → log + exit(1)
 *  3. createApp()    → mount middleware + routes
 *  4. listen(PORT)   → server siap menerima request
 *
 * Graceful shutdown (SIGTERM / SIGINT):
 *  1. server.close()  → berhenti menerima koneksi baru
 *  2. pool.end()      → tutup seluruh koneksi DB
 *  3. process.exit(0)
 */

import { config } from "./config/index.js";
import { testConnection, closePool } from "./config/database.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";

// ── Startup ────────────────────────────────────────────────────────────────────

async function start() {
  // 1. Koneksi DB (config sudah divalidasi saat import @/config)
  try {
    await testConnection();
  } catch (err) {
    logger.error({ err }, "server.startup — koneksi DB gagal");
    process.exit(1);
  }

  // 2. Buat Express app
  const app = createApp();

  // 3. Mulai listen
  const server = app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, env: config.NODE_ENV },
      `server.listening — Path\`Ora Backend berjalan di port ${config.PORT}`,
    );
  });

  // ── Graceful Shutdown ────────────────────────────────────────────────────────

  async function shutdown(signal: string) {
    logger.info(
      { signal },
      "server.shutdown — menerima sinyal, mulai shutdown",
    );

    server.close(async () => {
      logger.info("server.shutdown — HTTP server ditutup");

      try {
        await closePool();
      } catch (err) {
        logger.error({ err }, "server.shutdown — gagal menutup pool DB");
      }

      logger.info("server.shutdown — selesai");
      process.exit(0);
    });

    // Force exit bila shutdown tidak selesai dalam 10 detik
    setTimeout(() => {
      logger.error("server.shutdown — timeout, force exit");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

// ── Run ────────────────────────────────────────────────────────────────────────

start().catch((err: unknown) => {
  console.error("[server] Fatal error saat startup:", err);
  process.exit(1);
});
