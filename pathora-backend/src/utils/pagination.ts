/**
 * utils/pagination.ts
 *
 * Parse dan validasi parameter paginasi dari query string (VAL-006, SDD §3.5).
 *
 * Digunakan oleh controller yang menerima query ?limit=&offset= sebelum
 * meneruskan ke use-case dan repository.
 *
 * Aturan:
 *  - limit  : integer positif, default 10, maksimum 100
 *  - offset : integer ≥ 0, default 0
 *  - Nilai non-numerik atau di luar batas di-clamp ke default (tidak error)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
}

export interface PaginationResult {
  limit: number;
  offset: number;
  meta: PaginationMeta;
}

// ── Konstanta ──────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

// ── Helper ─────────────────────────────────────────────────────────────────────

/**
 * Parse nilai ke integer; kembalikan fallback bila tidak valid.
 */
function parseIntOrDefault(value: unknown, fallback: number): number {
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Clamp nilai ke rentang [min, max].
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ── Fungsi Utama ───────────────────────────────────────────────────────────────

/**
 * Mengekstrak dan memvalidasi parameter paginasi dari query string Express.
 *
 * @param query - `req.query` dari Express (Record<string, unknown>)
 * @returns     - { limit, offset, meta } yang sudah divalidasi & di-clamp
 *
 * @example
 * // GET /cvs?limit=20&offset=40
 * const { limit, offset, meta } = parsePagination(req.query);
 * // limit=20, offset=40, meta={ limit: 20, offset: 40 }
 *
 * // GET /cvs?limit=999  → di-clamp ke 100
 * // GET /cvs?limit=abc  → fallback ke 10
 * // GET /cvs?offset=-5  → di-clamp ke 0
 */
export function parsePagination(
  query: Record<string, unknown>,
): PaginationResult {
  const rawLimit = parseIntOrDefault(query["limit"], DEFAULT_LIMIT);
  const rawOffset = parseIntOrDefault(query["offset"], DEFAULT_OFFSET);

  const limit = clamp(rawLimit, 1, MAX_LIMIT);
  const offset = clamp(rawOffset, 0, Number.MAX_SAFE_INTEGER);

  return {
    limit,
    offset,
    meta: { limit, offset },
  };
}
