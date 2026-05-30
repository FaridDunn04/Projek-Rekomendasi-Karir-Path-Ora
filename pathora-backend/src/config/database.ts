/**
 * config/database.ts
 *
 * Inisialisasi PostgreSQL connection pool menggunakan DATABASE_URL
 * dan thin wrapper `query()` dengan logging durasi.
 *
 * pg.Pool menerima `connectionString` secara langsung — tidak perlu
 * memecah host/port/user/password secara manual (SDD §3.1).
 *
 * Seluruh repository mengimpor `query` dari sini (SEC-006, NFR-011).
 */

import { Pool, type QueryResultRow } from 'pg';
import { config } from '@/config';
import { logger } from '@/config/logger';

// ── Connection Pool ────────────────────────────────────────────────────────────

/**
 * Pool koneksi PostgreSQL.
 * Konfigurasi berasal dari DATABASE_URL (SDD §3.1, §9.1).
 * SSL diaktifkan di production untuk platform seperti Railway/Render.
 */
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.IS_PRODUCTION ? { rejectUnauthorized: false } : false,
});

// Log error pool-level agar tidak silent
pool.on('error', (err) => {
  logger.error({ err }, 'db.pool.error — koneksi idle mengalami error');
});

// ── Query Wrapper ──────────────────────────────────────────────────────────────

/**
 * Thin wrapper di atas `pool.query` yang mencatat durasi eksekusi.
 *
 * Semua repository wajib menggunakan fungsi ini — bukan `pool.query` langsung —
 * agar logging query konsisten (NFR-022) dan mudah di-mock saat testing.
 *
 * @param text   - SQL query string dengan placeholder $1, $2, ... (SEC-006)
 * @param params - Array nilai parameter (parameterized query, mencegah SQL injection)
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);

    logger.debug(
      {
        query: text.slice(0, 120),
        durationMs: Date.now() - start,
        rowCount: result.rowCount,
      },
      'db.query.ok',
    );

    return result;
  } catch (err) {
    logger.error(
      {
        query: text.slice(0, 120),
        durationMs: Date.now() - start,
        err,
      },
      'db.query.error',
    );
    throw err;
  }
}

// ── Koneksi Test ───────────────────────────────────────────────────────────────

/**
 * Menguji koneksi ke database dengan `SELECT 1`.
 * Dipanggil saat startup di `server.ts` sebelum server mulai menerima request.
 * Bila gagal, proses akan berhenti (fail-fast, NFR-016).
 */
export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('db.connection — PostgreSQL terhubung');
  } finally {
    client.release();
  }
}

/**
 * Menutup seluruh koneksi pool dengan graceful.
 * Dipanggil saat SIGTERM/SIGINT di `server.ts` (NFR-010).
 */
export async function closePool(): Promise<void> {
  await pool.end();
  logger.info('db.pool — koneksi ditutup');
}
