# Software Design Document (SDD) — Path`Ora Backend

> **Software Design Document — Backend API**
> Platform End-to-End Kesiapan Kerja dengan Dashboard Strategis & Rekomendasi Jalur Karir Otomatis

| Field | Value |
|---|---|
| **Nama Produk** | Path`Ora |
| **Komponen** | Backend API |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 30 Mei 2026 |
| **Status** | Draft |
| **Stack Teknologi** | Node.js + Express + TypeScript + Zod + PostgreSQL |
| **Dokumen Acuan** | PRD Path`Ora v1.2, SRS Path`Ora v1.0, SDD Frontend v1.0, API Contract (`docs/contract-api-Ai.json`) |
| **Lingkup** | Desain teknis Backend RESTful API untuk fitur F1–F7 (F8 Dashboard Admin dikecualikan) |
| **Repository Backend** | `pathora-backend/` |

---

## Daftar Isi

1. [Pendahuluan](#bab-1--pendahuluan)
2. [Arsitektur Sistem Backend](#bab-2--arsitektur-sistem-backend)
3. [Desain Modul & Komponen](#bab-3--desain-modul--komponen)
4. [Desain Database](#bab-4--desain-database)
5. [Desain API & Kontrak Endpoint](#bab-5--desain-api--kontrak-endpoint)
6. [Desain Keamanan](#bab-6--desain-keamanan)
7. [Desain Penanganan Error & Resiliensi](#bab-7--desain-penanganan-error--resiliensi)
8. [Desain Pengujian](#bab-8--desain-pengujian)
9. [Deployment & Konfigurasi Environment](#bab-9--deployment--konfigurasi-environment)
10. [Traceability Matrix SDD ↔ SRS](#bab-10--traceability-matrix-sdd--srs)
11. [Keputusan Desain & Alternatif yang Dipertimbangkan](#bab-11--keputusan-desain--alternatif-yang-dipertimbangkan)
- [Lampiran A — Daftar File & Tanggung Jawab](#lampiran-a--daftar-file--tanggung-jawab)
- [Lampiran B — Dependency NPM](#lampiran-b--dependency-npm)

---

## BAB 1 — Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen Software Design Document (SDD) Backend ini menerjemahkan kebutuhan yang tercantum pada SRS Path`Ora v1.0 menjadi **keputusan desain teknis backend yang konkret**: arsitektur berlapis, pemecahan modul, alur data antarkomponen, kontrak antarmuka (interface) tiap lapisan, skema basis data, kontrak endpoint, serta mekanisme penanganan error dan resiliensi.

SDD ini berfungsi sebagai **panduan implementasi tunggal** bagi developer backend. Setiap keputusan desain ditautkan secara eksplisit ke ID kebutuhan pada SRS (FR, NFR, SEC, VAL, DATA, API) dan PRD (BR, BTS, §10 API Contract), sehingga implementasi dapat ditelusuri balik ke kebutuhan asalnya. Berbeda dengan SRS yang menjawab "apa yang harus dilakukan sistem", SDD ini menjawab "**bagaimana** sistem dibangun secara teknis".

Dokumen ini juga menjaga keselarasan dengan **SDD Frontend v1.0**: bentuk respons, nama field, kode status, dan aturan filtering yang ditetapkan di sini adalah kontrak yang dikonsumsi oleh service layer frontend (Axios). Konsistensi ini memenuhi NFR-020 (konsistensi kontrak integrasi) dan NFR-021 (penanganan error konsisten).

### 1.2 Ruang Lingkup

**Tercakup dalam SDD ini:**

- Backend RESTful API (Express + TypeScript) untuk fitur **F1–F7**: Autentikasi & Sesi (F1), Dashboard Utama (F2), Upload & Manajemen CV (F3), Analisis CV via AI/ML (F4), Halaman Analysis (F5, sisi data), Rekomendasi Karir (F6, sisi data), dan Profile (F7).
- Integrasi dengan layanan AI/ML eksternal melalui **AI Gateway adapter** (HTTP) beserta mock adapter untuk pengembangan paralel (FR-015, BTS-03).
- Persistensi data ke **PostgreSQL** (users, cvs, analyses, categories) dengan kolom JSONB untuk payload hasil AI (DATA-003, DATA-005).
- Mekanisme keamanan: JWT (SEC-002), bcrypt (SEC-001), CORS (SEC-007), rate limiting (SEC-008), validasi & proteksi injeksi (SEC-005, SEC-006).
- Penanganan error terpusat dan resiliensi sistem terhadap kegagalan AI (NFR-009, FR-013).

**TIDAK tercakup (out of scope):**

- **Frontend SPA** — dibahas pada SDD Frontend v1.0.
- **Training / tuning model AI/ML** dan pipeline data science (BTS-06; tanggung jawab AI Engineer/Data Scientist). Backend hanya mengikat **kontrak integrasi** (§10 PRD).
- **F8 Dashboard Agregat Admin** — dikecualikan sepenuhnya dari dokumen ini sesuai instruksi scope.

### 1.3 Definisi & Singkatan Teknis

| Istilah | Penjelasan |
|---|---|
| **Use Case (Layer)** | Lapisan yang memuat *business logic* dan orkestrasi alur sebuah aksi; satu file = satu aksi (mis. `register.use-case.ts`). |
| **Controller** | Komponen yang menerima `req`, memanggil use-case, dan mengirim `res`; tidak memuat business logic. |
| **Repository** | Komponen akses data; satu-satunya lapisan yang mengeksekusi query SQL ke PostgreSQL. |
| **DTO (Data Transfer Object)** | Tipe/struktur data untuk memindahkan data antarlapisan (mis. `CreateUserDto`), bukan entitas DB mentah. |
| **Adapter Pattern** | Pola yang memisahkan kontrak (`interface`) dari implementasi konkret; dipakai pada AI Gateway. |
| **Factory Pattern** | Pola pembuatan objek yang memilih implementasi saat runtime (mis. pilih mock vs HTTP berdasarkan env). |
| **JSONB** | Tipe data biner JSON pada PostgreSQL; mendukung pengindeksan GIN dan query ke dalam struktur JSON. |
| **Pool** | *Connection pool* PostgreSQL (`pg.Pool`) yang menggunakan ulang koneksi DB untuk efisiensi. |
| **Middleware chain** | Rangkaian fungsi Express yang dieksekusi berurutan sebelum handler akhir. |
| **Guard** | Middleware otentikasi/otorisasi (di sini: `auth.ts` yang memverifikasi JWT). |
| **Mock Adapter** | Implementasi AI Gateway yang mengembalikan payload hardcoded sesuai kontrak, tanpa memanggil layanan nyata. |
| **HTTP Adapter** | Implementasi AI Gateway yang memanggil layanan AI nyata via HTTP (axios). |
| **Graceful degradation** | Kemampuan sistem tetap berjalan (tidak crash) saat dependensi (AI) gagal, dengan fallback. |
| **Circuit breaker** (konseptual) | Pola yang menghentikan sementara pemanggilan ke dependensi yang terus gagal; pada MVP belum diimplementasikan, dicatat sebagai evolusi. |
| **UUID** | Universally Unique Identifier; tipe primary key seluruh entitas utama. |
| **JWT** | JSON Web Token; mekanisme token autentikasi stateless. |
| **bcrypt** | Algoritma hashing password berbasis Blowfish dengan salt dan cost factor. |
| **Zod schema** | Skema validasi TypeScript-first; `.parse()`/`.safeParse()` memvalidasi dan meng-infer tipe. |

---

## BAB 2 — Arsitektur Sistem Backend

### 2.1 Gambaran Arsitektur

Backend Path`Ora menggunakan **layered architecture** dengan empat lapisan utama dan arah dependensi searah (top-down). Setiap permintaan HTTP melewati lapisan secara berurutan tanpa lompatan lapisan (mis. controller tidak boleh memanggil repository langsung; controller harus melalui use-case).

```
HTTP Request
     │
     ▼
[Route Layer]          ← Express Router + middleware chain (auth, validate, upload, rate-limit)
     │
     ▼
[Controller Layer]     ← Terima req, panggil use-case, format res via utils/response, next(err)
     │
     ▼
[Use-Case Layer]       ← Business logic, orkestrasi, validasi domain, ownership check
     │
     ├──▶ [Repository Layer]   ← Query PostgreSQL (parameterized $1,$2,...)
     │
     └──▶ [AI Gateway Layer]   ← HTTP ke AI service / mock adapter (via factory)
```

**Tanggung jawab tiap lapisan:**

| Lapisan | Tanggung Jawab | Larangan |
|---|---|---|
| **Route** | Mendefinisikan path, method, dan urutan middleware. | Tidak memuat logika bisnis. |
| **Controller** | Adaptasi HTTP ↔ domain: baca `req.body/params/query/user`, panggil use-case, bungkus respons, `next(err)`. | Tidak query DB, tidak memanggil AI gateway langsung, tidak memuat business rule. |
| **Use-Case** | Logika bisnis & orkestrasi: validasi domain, cek kepemilikan, koordinasi repository + gateway. | Tidak menyentuh objek `req`/`res` (agar mudah di-unit-test). |
| **Repository** | Akses data: eksekusi query parameterized, pemetaan baris → DTO/entity. | Tidak memuat business rule; tidak melempar error HTTP-spesifik selain `NotFound` opsional. |
| **AI Gateway** | Komunikasi ke layanan AI (atau mock) sesuai kontrak. | Tidak menyentuh DB; tidak mengetahui `req`/`res`. |

Prinsip arah dependensi: **Controller → Use-Case → (Repository | AI Gateway)**. Lapisan bawah tidak pernah mengimpor lapisan atas. Hal ini memenuhi NFR-016 (kualitas & maintainability) dan NFR-012 (stateless, mudah di-scale).

### 2.2 Diagram Komponen (Tekstual)

```
                         ┌──────────────────────────────────────────────┐
                         │                 src/server.ts                 │
                         │  entry point: load config → init DB pool →     │
                         │  test koneksi → createApp() → listen(PORT)     │
                         │  handle SIGTERM/SIGINT (graceful shutdown)     │
                         └───────────────────────┬──────────────────────┘
                                                 │ import createApp()
                                                 ▼
                         ┌──────────────────────────────────────────────┐
                         │                   src/app.ts                   │
                         │  Express app factory:                          │
                         │  cors → json parser → req-id → rate-limit →    │
                         │  routes(/api/v1) → notFound → error handler    │
                         └───────────────────────┬──────────────────────┘
                                                 │ mount
                                                 ▼
                         ┌──────────────────────────────────────────────┐
                         │              src/routes/index.ts               │
                         │  mount tiap domain router ke /api/v1            │
                         └──┬───────┬───────┬───────┬───────┬───────┬─────┘
                            │       │       │       │       │       │
        ┌───────────────────┘   ┌───┘   ┌───┘   ┌───┘   ┌───┘   ┌───┘
        ▼                       ▼       ▼       ▼       ▼       ▼
   [auth/]  [users/]  [cvs/]  [analyses/]  [dashboard/]  [categories/]  [health/]
        │        │       │         │             │            │            │
        │  route → controller → use-case → repository → config/database (pg.Pool)
        │                                  │
        │                          analyses/use-case ──▶ [services/ai-gateway/]
        │                                                      │ factory
        │                                            ┌─────────┴──────────┐
        │                                            ▼                    ▼
        │                                     ai-gateway.http      ai-gateway.mock
        │                                     (axios → AI svc)     (payload kontrak)
        │
   Cross-cutting (dipakai lintas domain):
     • src/config/        → index (env+Zod), database (pool, query()), logger (Pino)
     • src/middlewares/   → auth, error, validate, rate-limit, cors, upload
     • src/security/      → token-manager (JWT), password-manager (bcrypt)
     • src/exceptions/    → HttpException hierarchy (mapping ke status code)
     • src/utils/         → response, pagination, extract-text, ai-schema-validator
     • migrations/        → 001..005 SQL (schema + seed + index)
     • tests/             → unit (use-case, gateway, schema) + integration (Supertest)
```

### 2.3 Prinsip Desain yang Diadopsi

1. **Separation of Concerns (SoC)** — Tiap file memiliki satu tanggung jawab jelas (mis. `login.use-case.ts` hanya menangani logika login). Dampak: perubahan terlokalisasi, mudah ditest, mudah direview (NFR-016).

2. **Dependency Injection (manual/constructor)** — Use-case menerima repository dan AI gateway sebagai parameter konstruktor/fungsi, **bukan** mengimpor instance konkret secara langsung. Contoh: `createTriggerAnalysisUseCase({ cvsRepo, analysesRepo, aiGateway })`. Dampak: pada unit test, dependensi dapat di-mock tanpa menyentuh DB/AI nyata (Bab 8).

3. **Adapter Pattern untuk AI Gateway** — Kontrak `AiGatewayAdapter` (`ai-gateway.adapter.ts`) dipisahkan dari implementasinya (`ai-gateway.http.ts`, `ai-gateway.mock.ts`). Use-case hanya bergantung pada kontrak, sehingga penggantian implementasi (mock ↔ nyata) tidak mengubah satu baris pun di use-case (FR-015, NFR-020, SEC-011).

4. **Factory Pattern untuk AI Gateway** — `ai-gateway.factory.ts` memilih implementasi berdasarkan env `USE_MOCK_AI`. Factory dipanggil sekali saat startup dan instance-nya di-inject ke use-case (BTS-03).

5. **Fail-Fast pada konfigurasi** — `config/index.ts` memvalidasi seluruh env var dengan Zod `.parse(process.env)` saat startup. Bila ada variabel wajib yang kurang/format salah, proses **berhenti** sebelum menerima request (SEC-010, NFR-016).

6. **Consistent Response Shape** — Seluruh respons (sukses & error) memakai format `{ data, error, meta }` melalui `utils/response.ts` dan `middlewares/error.ts` (BTS-08, NFR-021).

7. **Parameterized Queries** — Semua query SQL memakai placeholder `$1, $2, ...` dengan array parameter; tidak ada penggabungan string input mentah, mencegah SQL injection (SEC-006, NFR-007).


---

## BAB 3 — Desain Modul & Komponen

Bab ini merinci tiap modul: tanggung jawab, file utama, interface/type yang diekspos, ketergantungan, dan catatan implementasi.

### 3.1 Modul `config/`

**Tanggung jawab:** Memuat dan memvalidasi konfigurasi, menyediakan koneksi DB, dan logger terpusat.

**`config/index.ts` — Env Validator (Zod):**
Memvalidasi `process.env` saat import pertama (fail-fast, prinsip 2.3.5). Bila gagal, `console.error(error.flatten())` lalu `process.exit(1)`.

```typescript
// src/config/index.ts
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  AI_BASE_URL: z.string().url().optional(),
  AI_TIMEOUT_MS: z.coerce.number().default(30000),
  USE_MOCK_AI: z.coerce.boolean().default(false),
  ALLOWED_ORIGINS: z.string(), // comma-separated
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  LOG_LEVEL: z.string().default('info'),
})
.refine((c) => c.USE_MOCK_AI || !!c.AI_BASE_URL, {
  message: 'AI_BASE_URL wajib bila USE_MOCK_AI=false',
  path: ['AI_BASE_URL'],
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('[CONFIG] Env tidak valid:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const config = {
  ...parsed.data,
  ALLOWED_ORIGINS: parsed.data.ALLOWED_ORIGINS.split(',').map((s) => s.trim()),
};
```

Alternatif menerima `DB_HOST/PORT/USER/PASSWORD/NAME` didukung dengan menambah field opsional dan menyusun `DATABASE_URL` bila `DATABASE_URL` tidak tersedia; pada MVP `DATABASE_URL` dijadikan sumber utama untuk kesederhanaan.

**`config/database.ts` — PostgreSQL Pool:**
Menginisialisasi `pg.Pool` dari `config.DATABASE_URL` dan mengekspor `query()` sebagai *thin wrapper* yang mencatat durasi query (logging konsisten, NFR-022).

```typescript
// src/config/database.ts
import { Pool, QueryResultRow } from 'pg';
import { config } from '@/config';
import { logger } from '@/config/logger';

export const pool = new Pool({ connectionString: config.DATABASE_URL });

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  logger.debug({ ms: Date.now() - start, rows: res.rowCount }, 'db.query');
  return res;
}
```

**`config/logger.ts` — Pino:**
Level `debug` di `development`, `info` di `production`; output JSON di production agar kompatibel dengan log aggregator. Mengekspos instance `logger` tunggal.

**Depends on:** `zod`, `pg`, `pino`.

### 3.2 Modul `exceptions/`

**Tanggung jawab:** Mendefinisikan hirarki error domain yang dipetakan ke kode status HTTP oleh `middlewares/error.ts`.

```
Error (native)
  └── HttpException (base-error.ts)            → properti: statusCode, message, details?
        ├── ClientError (client-error.ts)       → 400 / 422
        ├── AuthenticationError (...)            → 401
        ├── AuthorizationError (...)             → 403
        ├── NotFoundError (not-found-error.ts)   → 404
        ├── ConflictError (conflict-error.ts)    → 409
        ├── InvariantError (invariant-error.ts)  → 422 (assertion domain)
        └── AiGatewayError (ai-gateway-error.ts) → 502 / 504 / 422 (by type)
```

```typescript
// src/exceptions/base-error.ts
export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

// src/exceptions/ai-gateway-error.ts
export type AiErrorType = 'timeout' | 'upstream_error' | 'invalid_response';
const STATUS_BY_TYPE: Record<AiErrorType, number> = {
  timeout: 504,
  upstream_error: 502,
  invalid_response: 422,
};
export class AiGatewayError extends HttpException {
  constructor(public readonly type: AiErrorType, message?: string, details?: unknown) {
    super(STATUS_BY_TYPE[type], message ?? `AI gateway ${type}`, details);
  }
}
```

**Catatan implementasi:** `AiGatewayError` membawa `type` untuk membedakan 504 (timeout, NFR-003), 502 (upstream error), dan 422 (respons tidak valid, VAL-007). `exceptions/index.ts` melakukan barrel export seluruh kelas.

**Depends on:** —

### 3.3 Modul `middlewares/`

**`auth.ts` — JWT Guard (FR-004, SEC-002):**
Signature `(req, res, next)`. Mengekstrak header `Authorization: Bearer <token>`; bila tidak ada → lempar `AuthenticationError('Token tidak ditemukan')`. Memanggil `tokenManager.verify(token)`; bila gagal/expired → lempar `AuthenticationError('Token tidak valid')`. Bila sukses, set `req.user = { id, email }` lalu `next()`.

```typescript
// src/middlewares/auth.ts
export function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AuthenticationError('Token tidak ditemukan'));
  }
  try {
    req.user = tokenManager.verify(header.slice(7)); // { id, email }
    next();
  } catch {
    next(new AuthenticationError('Token tidak valid atau kedaluwarsa'));
  }
}
```

**`error.ts` — Global Error Handler (NFR-021):**
Express error handler 4-parameter `(err, req, res, next)`. Bila `err instanceof HttpException` → gunakan `err.statusCode` + `response.error(err.message, err.details)`. Bila bukan → log sebagai unknown (`logger.error`), kembalikan 500 dengan pesan generik (tanpa membocorkan stack ke klien).

```typescript
// src/middlewares/error.ts
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpException) {
    return res.status(err.statusCode).json(response.error(err.message, err.details));
  }
  logger.error({ err, reqId: req.id }, 'unhandled.error');
  return res.status(500).json(response.error('Terjadi kesalahan pada server'));
}
```

**`validate.ts` — Zod Validation Factory (SEC-005, VAL-001..006):**
Factory `validate(schema, source)` mengembalikan middleware. Memanggil `schema.safeParse(req[source])`; bila gagal → lempar `ClientError('Validasi gagal', zodError.flatten().fieldErrors)`; bila sukses → menimpa `req[source]` dengan data ter-parse (ter-coerce & ter-trim).

```typescript
// src/middlewares/validate.ts
export const validate =
  (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ClientError('Validasi gagal', result.error.flatten().fieldErrors));
    }
    (req as Record<string, unknown>)[source] = result.data;
    next();
  };
```

**`rate-limit.ts` (SEC-008, NFR-008):**
Mengkonfigurasi `express-rate-limit` dengan `windowMs` & `max` dari config. Custom `handler` mengembalikan `{ data: null, error: { message: 'Too many requests' }, meta: {} }` dengan status 429. Mengekspor `globalLimiter` dan `strictLimiter` (untuk login & analyze) — lihat §6.4.

**`cors.ts` (SEC-007):**
Setup `cors` dengan `origin: config.ALLOWED_ORIGINS`, `credentials: true`. Origin tak diizinkan ditolak otomatis.

**`upload.ts` — Multer (FR-009, VAL-004):**
`multer.memoryStorage()` (tidak menulis ke disk; buffer diteruskan ke `extract-text`). `fileFilter` membatasi MIME `application/pdf` dan `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX); MIME lain → `ClientError`. `limits.fileSize = config.MAX_FILE_SIZE_MB * 1024 * 1024`.

**Depends on:** `security/token-manager`, `exceptions/`, `utils/response`, `express-rate-limit`, `cors`, `multer`, `zod`.

### 3.4 Modul `security/`

**`token-manager.ts` (SEC-002, NFR-006):**
Mengekspos objek dengan `sign(payload: TokenPayload): string` dan `verify(token: string): TokenPayload`, memakai `jsonwebtoken` dengan `config.JWT_SECRET` dan `expiresIn: config.JWT_EXPIRES_IN`.

```typescript
// src/security/token-manager.ts
export interface TokenPayload { id: string; email: string; }

export const tokenManager = {
  sign: (payload: TokenPayload): string =>
    jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN }),
  verify: (token: string): TokenPayload => {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return { id: decoded.id as string, email: decoded.email as string };
  },
};
```

**`password-manager.ts` (SEC-001, NFR-005):**
`hash(plain): Promise<string>` (bcrypt, `saltRounds = 12`) dan `compare(plain, hash): Promise<boolean>`.

```typescript
// src/security/password-manager.ts
const SALT_ROUNDS = 12;
export const passwordManager = {
  hash: (plain: string) => bcrypt.hash(plain, SALT_ROUNDS),
  compare: (plain: string, hash: string) => bcrypt.compare(plain, hash),
};
```

**Depends on:** `jsonwebtoken`, `bcrypt`, `config`.

### 3.5 Modul `utils/`

**`response.ts` (BTS-08, NFR-021):**
```typescript
// src/utils/response.ts
export const response = {
  success: <T>(data: T, meta: Record<string, unknown> = {}) => ({ data, error: null, meta }),
  error: (message: string, details?: unknown) => ({
    data: null,
    error: details === undefined ? { message } : { message, details },
    meta: {},
  }),
};
```

**`pagination.ts` (VAL-006, API-007, API-012):**
Parse & validasi `limit` (default 10, max 100) dan `offset` (default 0, min 0) dari query; kembalikan `{ limit, offset, meta: { limit, offset } }`. Nilai non-numerik di-*clamp* ke default.

**`extract-text.ts` (FR-009):**
`extractText(buffer: Buffer, mimeType: string): Promise<string>` — `pdf-parse` untuk PDF, `mammoth` untuk DOCX. Bila ekstraksi gagal atau hasil kosong → lempar `ClientError('Gagal mengekstrak teks dari berkas')`.

**`ai-schema-validator.ts` (VAL-007, NFR-018, NFR-020):**
Mendefinisikan `AiResponseSchema` (Zod) yang merepresentasikan API Contract (§10 PRD / `contract-api-Ai.json`) dan mengekspor `validateAiResponse(data)` yang melempar `AiGatewayError('invalid_response')` bila parse gagal. Schema ini ditempatkan di `services/ai-gateway/ai-response.schema.ts` dan di-*re-use* di sini sebagai single source of truth.

```typescript
// src/services/ai-gateway/ai-response.schema.ts
import { z } from 'zod';

export const AiResponseSchema = z.object({
  cv_id: z.string(),
  analyzed_at: z.string(),
  predicted_category: z.string(),
  confidence: z.number().min(0).max(1),
  top_5_predictions: z.array(
    z.object({ category: z.string(), confidence: z.number() }),
  ).min(1),
  extracted_skills: z.array(
    z.object({
      category: z.string(),
      matched_skills: z.array(z.object({ skill: z.string(), similarity: z.number() })),
      missing_skills: z.array(z.string()),
    }),
  ),
  career_recommendations: z.array(
    z.object({ category: z.string(), match_score: z.number() }),
  ),
  description_career_recommendations: z.string().nullable(),
});
export type AiAnalysisResult = z.infer<typeof AiResponseSchema>;
```

```typescript
// src/utils/ai-schema-validator.ts
export function validateAiResponse(data: unknown): AiAnalysisResult {
  const parsed = AiResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new AiGatewayError('invalid_response', 'Respons AI tidak sesuai schema',
      parsed.error.flatten());
  }
  return parsed.data;
}
```

**Depends on:** `zod`, `pdf-parse`, `mammoth`, `exceptions/`.

### 3.6 Modul `services/ai-gateway/`

Modul paling kritis untuk resiliensi (FR-013, NFR-009). Menerapkan Adapter + Factory.

**Interface (`ai-gateway.adapter.ts`):**
```typescript
// src/services/ai-gateway/ai-gateway.adapter.ts
import { AiAnalysisResult } from './ai-response.schema';
export interface AiGatewayAdapter {
  analyze(rawText: string, cvId: string): Promise<AiAnalysisResult>;
}
```

**HTTP Adapter (`ai-gateway.http.ts`):**
- `axios.post(config.AI_BASE_URL + '/analyze', { cv_id, raw_text }, { timeout: config.AI_TIMEOUT_MS })`.
- Penanganan error axios:
  - `err.code === 'ECONNABORTED'` (timeout) → `AiGatewayError('timeout')` → 504 (NFR-003).
  - `err.response?.status >= 500` → `AiGatewayError('upstream_error')` → 502.
- Validasi body dengan `validateAiResponse()` sebelum `return` (bila invalid → `AiGatewayError('invalid_response')` → 422).

```typescript
// src/services/ai-gateway/ai-gateway.http.ts
export class HttpAiGateway implements AiGatewayAdapter {
  async analyze(rawText: string, cvId: string): Promise<AiAnalysisResult> {
    try {
      const { data } = await axios.post(
        `${config.AI_BASE_URL}/analyze`,
        { cv_id: cvId, raw_text: rawText },
        { timeout: config.AI_TIMEOUT_MS },
      );
      return validateAiResponse(data);
    } catch (err) {
      if (err instanceof AiGatewayError) throw err; // invalid_response dari validator
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') throw new AiGatewayError('timeout');
        if ((err.response?.status ?? 0) >= 500) throw new AiGatewayError('upstream_error');
      }
      throw new AiGatewayError('upstream_error', 'Kegagalan tak terduga pada AI gateway');
    }
  }
}
```

**Mock Adapter (`ai-gateway.mock.ts`) (FR-015):**
Mengembalikan payload hardcoded yang lolos `AiResponseSchema`, dengan `await sleep(200)` untuk meniru latensi. Mencakup seluruh field: `predicted_category`, `confidence`, `top_5_predictions` (5 item dengan confidence beragam termasuk di bawah & di atas 0.05), `extracted_skills` (matched + missing), `career_recommendations` (beberapa item dengan `match_score` beragam termasuk di bawah & di atas 0.3), dan `description_career_recommendations`. Data mock diselaraskan dengan `docs/contract-api-Ai.json` agar konsisten dengan ekspektasi frontend (NFR-020).

**Factory (`ai-gateway.factory.ts`) (BTS-03):**
```typescript
// src/services/ai-gateway/ai-gateway.factory.ts
export function createAiGateway(): AiGatewayAdapter {
  return config.USE_MOCK_AI ? new MockAiGateway() : new HttpAiGateway();
}
```
Dipanggil sekali saat startup; instance di-inject ke `trigger-analysis.use-case`.

**Depends on:** `axios`, `config`, `utils/ai-schema-validator`, `exceptions/`.

### 3.7 Domain Services (F1–F7)

Setiap domain mengikuti struktur: `routes/ → controllers/ → use-cases/ → repositories/ (+ validators/)`.

#### 3.7.1 Domain `auth/` (FR-001, FR-002, FR-003, FR-004; API-001, API-002)

**Routes (`auth.route.ts`):**
- `POST /api/v1/auth/register` → `strictLimiter` → `validate(RegisterSchema, 'body')` → `authController.register`
- `POST /api/v1/auth/login` → `strictLimiter` → `validate(LoginSchema, 'body')` → `authController.login`

**Validator (`auth.schema.ts`) — Zod (VAL-001, VAL-002):**
- `RegisterSchema`: `full_name` `z.string().min(2).max(100)`, `email` `z.string().email()`, `password` `z.string().min(8).max(72)` (72 = batas byte bcrypt).
- `LoginSchema`: `email` `z.string().email()`, `password` `z.string().min(1)`.

**Controller (`auth.controller.ts`):**
- `register`: `const user = await registerUseCase.execute(req.body)` → `res.status(201).json(response.success(user))`.
- `login`: `const result = await loginUseCase.execute(req.body)` → `res.status(200).json(response.success(result))` (`{ token, user }`).
- Semua dibungkus `try/catch` dengan `next(err)`.

**Use-Cases:**
- `register.use-case.ts`: (1) `authRepo.findByEmail(email)` → bila ada lempar `ConflictError('Email sudah terdaftar')` (409, FR-001); (2) `passwordManager.hash(password)`; (3) `authRepo.createUser({ full_name, email, password_hash })`; (4) return `User` **tanpa** `password_hash` (SEC-001).
- `login.use-case.ts`: (1) `authRepo.findByEmail(email)` → bila null lempar `AuthenticationError('Email atau password salah')` (401, pesan generik, FR-002); (2) `passwordManager.compare(password, user.password_hash)` → bila false lempar `AuthenticationError` yang **sama** (tidak membocorkan field mana yang salah); (3) `tokenManager.sign({ id, email })`; (4) return `{ token, user }` (tanpa `password_hash`).

**Repository (`auth.repository.ts`):**
- `findByEmail(email): Promise<UserWithHash | null>` — `SELECT id, email, password_hash, full_name, created_at FROM users WHERE email=$1`.
- `createUser(data: CreateUserDto): Promise<User>` — `INSERT ... RETURNING id, email, full_name, created_at` (kolom dieksplisitkan, tanpa `password_hash`, SEC-001/§6.2).

#### 3.7.2 Domain `users/` (FR-022; API-003, API-004)

**Routes:** `GET /api/v1/users/me` → `auth` → `usersController.getMe`; `PATCH /api/v1/users/me` → `auth` → `validate(UpdateProfileSchema, 'body')` → `usersController.updateMe`.

**Validator (`users.schema.ts`) (VAL-005):**
`UpdateProfileSchema` = `z.object({ full_name: z.string().min(2).optional(), email: z.string().email().optional() }).refine(d => d.full_name !== undefined || d.email !== undefined, { message: 'Minimal satu field harus diisi' })`.

**Use-Cases:**
- `get-profile.use-case.ts`: `usersRepo.findById(userId)` → bila null `NotFoundError('Pengguna tidak ditemukan')` → return user.
- `update-profile.use-case.ts`: bila `email` diubah → `usersRepo.findByEmail(email)`; bila ada & `row.id !== userId` → `ConflictError('Email sudah digunakan')` (409, FR-022/VAL-005); lalu `usersRepo.update(userId, data)` → return updated user.

**Repository (`users.repository.ts`):**
- `findById(id): Promise<User | null>`, `findByEmail(email): Promise<User | null>`, `update(id, data: Partial<UpdateUserDto>): Promise<User>` (UPDATE dinamis pada kolom yang ada, `RETURNING` kolom non-sensitif).

#### 3.7.3 Domain `cvs/` (FR-008..FR-012; API-006..API-009, API-010, API-011)

**Routes (`cvs.route.ts`):**
- `POST /api/v1/cvs` → `auth` → `upload.single('file')` → `cvsController.upload` (mendukung teks via body & berkas via multipart).
- `GET /api/v1/cvs` → `auth` → `cvsController.list`
- `GET /api/v1/cvs/:cvId` → `auth` → `validate(CvIdParamSchema, 'params')` → `cvsController.getOne`
- `DELETE /api/v1/cvs/:cvId` → `auth` → `validate(CvIdParamSchema, 'params')` → `cvsController.remove`
- `POST /api/v1/cvs/:cvId/analyze` → `auth` → `strictLimiter` → `validate(CvIdParamSchema, 'params')` → `analysesController.trigger`
- `GET /api/v1/cvs/:cvId/analysis` → `auth` → `validate(CvIdParamSchema, 'params')` → `analysesController.getLatestByCv`

**Validator (`cvs.schema.ts`) (VAL-003, VAL-006):**
- `UploadCvTextSchema`: `source_type: z.literal('text')`, `raw_text: z.string().min(100)`.
- `CvIdParamSchema`: `cvId: z.string().uuid()`.

**Controller:** `upload` mendeteksi mode — bila `req.file` ada → `uploadCvFileUseCase.execute({ userId, buffer, mimeType })`; selain itu validasi body dengan `UploadCvTextSchema` lalu `uploadCvTextUseCase.execute({ userId, raw_text })`. Mengembalikan 201 `response.success({ cv_id, ... })`.

**Use-Cases:**
- `upload-cv-text.use-case.ts`: validasi panjang `raw_text` (≥100) → `cvsRepo.create({ user_id, source_type: 'text', raw_text })` → return CV.
- `upload-cv-file.use-case.ts`: `extractText(buffer, mimeType)` → bila hasil < 100 karakter `ClientError('Teks hasil ekstraksi terlalu pendek, gunakan input teks')` (VAL-004 fallback) → `cvsRepo.create({ user_id, source_type: 'file', raw_text: extracted })` → return CV.
- `delete-cv.use-case.ts`: `cvsRepo.findById(cvId)` → null `NotFoundError`; `cv.user_id !== userId` → `AuthorizationError` (403, SEC-003) → `cvsRepo.delete(cvId)`.
- `list-cvs.use-case.ts`: `cvsRepo.findByUser(userId, { limit, offset })` → return list + meta paginasi.

**Repository (`cvs.repository.ts`):**
- `create(data: CreateCvDto): Promise<Cv>`, `findById(id): Promise<Cv | null>`, `findByUser(userId, pagination): Promise<Cv[]>` (`WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`), `delete(id): Promise<void>`.

#### 3.7.4 Domain `analyses/` (FR-013, FR-014, FR-015; API-010..API-013)

Use-case paling kompleks. Alur lengkap `trigger-analysis.use-case.ts`:

```
trigger-analysis.use-case.ts (input: { userId, cvId })
1. cv = cvsRepo.findById(cvId)
   → null            : throw NotFoundError('CV tidak ditemukan')           (404)
   → cv.user_id≠userId: throw AuthorizationError('Bukan milik Anda')        (403, SEC-003)
2. analysis = analysesRepo.create({ cv_id, user_id, status: 'pending' })   (DATA-003, §11)
   → analysisId = analysis.id
3. try:
   a. result = await aiGateway.analyze(cv.raw_text, cvId)
        • AiGatewayError('timeout')          → (lihat catch) → 504 (NFR-003)
        • AiGatewayError('upstream_error')   → (lihat catch) → 502
        • AiGatewayError('invalid_response') → (lihat catch) → 422 (VAL-007)
   b. analysesRepo.update(analysisId, {
        status: 'success',
        predicted_category: result.predicted_category,
        confidence: result.confidence,
        result: result,            // disimpan sebagai JSONB (DATA-005, NFR-018)
        analyzed_at: new Date(),
      })
   c. return { analysisId, ...result }                                      (200, FR-013)
4. catch (err):
   → if analysisId: analysesRepo.update(analysisId, { status: 'failed' })  (FR-013)
   → logger.error({ err, cvId, analysisId }, 'analysis.failed')            (NFR-022)
   → throw err   // diteruskan ke error handler → status sesuai AiGatewayError.type
```

`get-analysis.use-case.ts`: `analysesRepo.findById(analysisId)` → null `NotFoundError`; cek kepemilikan (`user_id !== userId` → `AuthorizationError`, SEC-003); return full analysis termasuk `result` (JSONB). Sebelum dikembalikan, **aturan filtering tampilan diterapkan di layer ini** (§5.4): `top_5_predictions` (>0.05), `career_recommendations` (>0.3), `matched_skills` sort desc.

`list-analyses.use-case.ts`: `analysesRepo.findByUser(userId, pagination)` → return summary `{ id, cv_id, status, predicted_category, confidence, analyzed_at, created_at }` (tanpa `result` penuh, efisiensi — NFR-011).

**Repository (`analyses.repository.ts`):**
- `create(data: CreateAnalysisDto): Promise<Analysis>` (status default `pending`).
- `update(id, data: Partial<UpdateAnalysisDto>): Promise<Analysis>` (UPDATE dinamis: status/predicted_category/confidence/result/analyzed_at).
- `findById(id): Promise<Analysis | null>` (include full `result` JSONB).
- `findByUser(userId, pagination): Promise<AnalysisSummary[]>` (hanya kolom summary).
- `findLatestByCvId(cvId): Promise<Analysis | null>` (`WHERE cv_id=$1 ORDER BY created_at DESC LIMIT 1`).

#### 3.7.5 Domain `dashboard/` (FR-005, FR-006, FR-007; API-005)

**Route:** `GET /api/v1/dashboard/me` → `auth` → `dashboardController.getMyDashboard`.

**Use-Case (`get-dashboard.use-case.ts`):** Menjalankan paralel `Promise.all([ getLastAnalysis(userId), getRecentHistory(userId, 5) ])` → return `{ lastAnalysis: a | null, recentHistory: b }` (FR-005 empty state ditangani FE bila `lastAnalysis === null`).

**Repository (`dashboard.repository.ts`):**
- `getLastAnalysis(userId): Promise<AnalysisSummary | null>` — `SELECT id, predicted_category, confidence, analyzed_at FROM analyses WHERE user_id=$1 AND status='success' ORDER BY analyzed_at DESC LIMIT 1`.
- `getRecentHistory(userId, limit): Promise<AnalysisSummary[]>` — JOIN `analyses a` + `cvs c` `ON a.cv_id=c.id WHERE a.user_id=$1 ORDER BY a.created_at DESC LIMIT $2`.

#### 3.7.6 Domain `categories/` (FR-024; API-014)

**Route:** `GET /api/v1/categories` — **tanpa auth** (Guest boleh akses, ACT-01).

**Implementasi cache in-memory:** Data kategori statis. Pada pemanggilan pertama, controller/use-case query DB lalu menyimpan hasil ke variabel modul; pemanggilan berikutnya langsung mengembalikan cache. **TTL:** permanen hingga server restart (didokumentasikan; lihat keputusan §11.2). Reset cache hanya melalui restart proses.

**Repository (`categories.repository.ts`):** `findAll(): Promise<Category[]>` — `SELECT code, display_name, description FROM categories ORDER BY code`.

#### 3.7.7 Domain `health/` (FR-025; API-015)

**Route:** `GET /api/v1/health` — tanpa auth.

**Controller (`health.controller.ts`):** Eksekusi `SELECT 1`. Bila sukses → 200 `{ status: 'ok', timestamp, db: 'ok' }`. Bila gagal → 503 `{ status: 'degraded', db: 'error' }` (NFR-010, NFR-022). Catatan: health menggunakan body ringkas dan boleh tidak dibungkus `{data,error,meta}` agar mudah dibaca probe platform; namun pada implementasi tetap dibungkus `response.success(...)` untuk konsistensi.


---

## BAB 4 — Desain Database

### 4.1 Skema Tabel

DDL lengkap (selaras Model Data PRD §11 dan DATA-001..DATA-006). File migrasi dijalankan berurutan oleh `npm run migrate`.

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

```sql
-- migrations/002_create_cvs.sql
CREATE TABLE cvs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('text', 'file')),
  raw_text    TEXT NOT NULL,
  file_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

```sql
-- migrations/003_create_analyses.sql
CREATE TABLE analyses (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id              UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status             TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed'))
                     DEFAULT 'pending',
  predicted_category TEXT,
  confidence         NUMERIC(5,4),
  result             JSONB,
  analyzed_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

```sql
-- migrations/004_create_categories.sql
CREATE TABLE categories (
  code         TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description  TEXT
);

-- Seed data (selaras dengan kategori pada docs/contract-api-Ai.json):
INSERT INTO categories (code, display_name, description) VALUES
  ('INFORMATION-TECHNOLOGY', 'Information Technology', 'Bidang IT & Software Development'),
  ('DATA-SCIENCE',           'Data Science',           'Analisis data, ML, dan statistik'),
  ('ENGINEERING',            'Engineering',            'Rekayasa teknik'),
  ('DIGITAL-MEDIA',          'Digital Media',          'Media digital, desain, dan konten'),
  ('BUSINESS-DEVELOPMENT',   'Business Development',   'Pengembangan bisnis dan penjualan'),
  ('FINANCE',                'Finance',                'Keuangan dan akuntansi');
```

```sql
-- migrations/005_add_indexes.sql
CREATE INDEX idx_cvs_user_id                 ON cvs(user_id);
CREATE INDEX idx_analyses_user_id            ON analyses(user_id);
CREATE INDEX idx_analyses_cv_id              ON analyses(cv_id);
CREATE INDEX idx_analyses_status             ON analyses(status);
CREATE INDEX idx_analyses_predicted_category ON analyses(predicted_category);
CREATE INDEX idx_analyses_analyzed_at        ON analyses(analyzed_at DESC);
CREATE INDEX idx_analyses_result_gin         ON analyses USING GIN (result);
```

> **Catatan:** `gen_random_uuid()` memerlukan ekstensi `pgcrypto` (PostgreSQL ≥ 13 menyediakannya secara built-in pada banyak distribusi; bila tidak, jalankan `CREATE EXTENSION IF NOT EXISTS pgcrypto;` di migrasi awal).

### 4.2 Relasi Antar Tabel

```
users (1) ───< (N) cvs (1) ───< (N) analyses
   │                                   ▲
   └───────────────< (N) ──────────────┘  (analyses.user_id → users.id, denormalisasi untuk query cepat)
```

- **`users` → `cvs`** (1:N): satu pengguna memiliki banyak CV. `cvs.user_id` FK dengan `ON DELETE CASCADE`.
- **`cvs` → `analyses`** (1:N): satu CV dapat memiliki banyak analisis (mis. retry). `analyses.cv_id` FK dengan `ON DELETE CASCADE`.
- **`analyses.user_id`**: denormalisasi pemilik agar query riwayat/dashboard cukup filter `WHERE user_id=$1` tanpa JOIN (efisiensi, NFR-011) sekaligus memperkuat ownership enforcement (SEC-003).

**Keputusan `ON DELETE CASCADE` (DATA-006):** bila `users` dihapus, seluruh `cvs` dan `analyses` miliknya ikut terhapus; bila sebuah `cv` dihapus (FR-012, API-009), seluruh `analyses` terkait ikut terhapus. Hal ini menjaga integritas referensial tanpa baris yatim (orphan) dan menyederhanakan logika hapus di use-case.

### 4.3 Keputusan Desain JSONB

Kolom `analyses.result` bertipe **JSONB** (DATA-005, NFR-018):

1. **Fleksibilitas skema** — Model AI dapat berubah struktur payload (menambah field) tanpa `ALTER TABLE`. Validasi tetap dijaga oleh `AiResponseSchema` (Zod) di layer aplikasi (VAL-007).
2. **Metadata terpisah** — Field utama (`predicted_category`, `confidence`, `status`, `analyzed_at`) disimpan sebagai kolom tersendiri agar query dashboard/riwayat efisien tanpa parsing JSONB (NFR-011).
3. **GIN index** — `idx_analyses_result_gin` memungkinkan query ke dalam JSONB (mis. mencari analisis yang memuat skill tertentu) bila dibutuhkan di masa depan, tanpa migrasi tambahan.

---

## BAB 5 — Desain API & Kontrak Endpoint

### 5.1 Konvensi Global

- **Base URL:** `/api/v1`.
- **Format request:** `Content-Type: application/json` untuk body; `multipart/form-data` untuk upload berkas (`POST /cvs`).
- **Format response (selalu):**
  ```jsonc
  {
    "data":  /* T | null */,
    "error": /* { "message": string, "details"?: unknown } | null */,
    "meta":  /* Record<string, unknown> (mis. pagination) */
  }
  ```
- **Auth header:** `Authorization: Bearer <jwt_token>` untuk endpoint privat.
- **Error code mapping** (dikelola `middlewares/error.ts`):

| Exception | HTTP Status |
|---|---|
| `AuthenticationError` | 401 |
| `AuthorizationError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |
| `ClientError` / `InvariantError` | 422 |
| `AiGatewayError('upstream_error')` | 502 |
| `AiGatewayError('timeout')` | 504 |
| `AiGatewayError('invalid_response')` | 422 |
| Rate limit terlampaui | 429 |
| Error tak dikenal | 500 |

### 5.2 Tabel Endpoint

Selaras API-001 s/d API-015 (SRS §6) dan PRD §9. Endpoint admin (`/dashboard/summary`) dikecualikan (F8 di luar scope).

| Method | Path | Auth | Request | Response 2xx | Error | Middleware Chain |
|---|---|---|---|---|---|---|
| POST | `/auth/register` | ❌ | body: full_name, email, password | 201 `{ user }` | 422, 409 | strictLimiter → validate(body) |
| POST | `/auth/login` | ❌ | body: email, password | 200 `{ token, user }` | 422, 401 | strictLimiter → validate(body) |
| GET | `/users/me` | ✅ | — | 200 `{ user }` | 401 | auth |
| PATCH | `/users/me` | ✅ | body: full_name?, email? | 200 `{ user }` | 401, 409, 422 | auth → validate(body) |
| GET | `/dashboard/me` | ✅ | — | 200 `{ lastAnalysis, recentHistory }` | 401 | auth |
| POST | `/cvs` | ✅ | body teks / multipart file | 201 `{ cv_id, ... }` | 401, 422, 413 | auth → upload.single('file') |
| GET | `/cvs` | ✅ | query: limit?, offset? | 200 `Cv[]` + meta | 401 | auth |
| GET | `/cvs/:cvId` | ✅ | param: cvId (uuid) | 200 `Cv` | 401, 403, 404 | auth → validate(params) |
| DELETE | `/cvs/:cvId` | ✅ | param: cvId | 200/204 | 401, 403, 404 | auth → validate(params) |
| POST | `/cvs/:cvId/analyze` | ✅ | param: cvId | 200 `Analysis` (payload kontrak) | 401, 403, 404, 422, 502, 504 | auth → strictLimiter → validate(params) |
| GET | `/cvs/:cvId/analysis` | ✅ | param: cvId | 200 `Analysis` (terbaru) | 401, 403, 404 | auth → validate(params) |
| GET | `/analyses` | ✅ | query: limit?, offset? | 200 `AnalysisSummary[]` + meta | 401 | auth |
| GET | `/analyses/:analysisId` | ✅ | param: analysisId (uuid) | 200 `Analysis` (full, terfilter) | 401, 403, 404 | auth → validate(params) |
| GET | `/categories` | ❌ | — | 200 `Category[]` | 500 | (cache in-memory) |
| GET | `/health` | ❌ | — | 200 `{ status, db }` | 503 | — |

### 5.3 Contoh Response

**`POST /auth/register` — sukses (201):**
```json
{
  "data": {
    "id": "8f1c1c2e-1b2a-4c3d-9e4f-5a6b7c8d9e0f",
    "email": "rani@example.com",
    "full_name": "Rani Pratiwi",
    "created_at": "2026-05-30T08:00:00Z"
  },
  "error": null,
  "meta": {}
}
```

**`POST /auth/login` — sukses (200):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<payload>.<sig>",
    "user": {
      "id": "8f1c1c2e-1b2a-4c3d-9e4f-5a6b7c8d9e0f",
      "email": "rani@example.com",
      "full_name": "Rani Pratiwi",
      "created_at": "2026-05-30T08:00:00Z"
    }
  },
  "error": null,
  "meta": {}
}
```

**`POST /cvs/:cvId/analyze` — sukses (200), payload sesuai API Contract §10:**
```json
{
  "data": {
    "analysisId": "a1b2c3d4-0000-1111-2222-333344445555",
    "cv_id": "uuid-abc123",
    "analyzed_at": "2025-01-15T10:30:00Z",
    "predicted_category": "INFORMATION-TECHNOLOGY",
    "confidence": 0.832,
    "top_5_predictions": [
      { "category": "INFORMATION-TECHNOLOGY", "confidence": 0.832 },
      { "category": "ENGINEERING", "confidence": 0.075 }
    ],
    "extracted_skills": [
      {
        "category": "INFORMATION-TECHNOLOGY",
        "matched_skills": [
          { "skill": "Python", "similarity": 0.92 },
          { "skill": "TensorFlow", "similarity": 0.89 }
        ],
        "missing_skills": ["Project Management", "Salesforce"]
      }
    ],
    "career_recommendations": [
      { "category": "INFORMATION-TECHNOLOGY", "match_score": 0.832 }
    ],
    "description_career_recommendations": "Based on the predicted category and extracted skills, ..."
  },
  "error": null,
  "meta": {}
}
```

**`POST /cvs/:cvId/analyze` — gagal timeout (504):**
```json
{
  "data": null,
  "error": { "message": "AI gateway timeout" },
  "meta": {}
}
```

**`GET /dashboard/me` — sukses (200), dengan analisis sebelumnya:**
```json
{
  "data": {
    "lastAnalysis": {
      "analysisId": "a1b2c3d4-0000-1111-2222-333344445555",
      "predicted_category": "INFORMATION-TECHNOLOGY",
      "confidence": 0.832,
      "analyzed_at": "2025-01-15T10:30:00Z"
    },
    "recentHistory": [
      {
        "analysisId": "a1b2c3d4-0000-1111-2222-333344445555",
        "cv_id": "uuid-abc123",
        "predicted_category": "INFORMATION-TECHNOLOGY",
        "confidence": 0.832,
        "created_at": "2025-01-15T10:30:00Z"
      }
    ]
  },
  "error": null,
  "meta": {}
}
```

**`GET /dashboard/me` — sukses (200), tanpa analisis sebelumnya (empty state, FR-005):**
```json
{
  "data": { "lastAnalysis": null, "recentHistory": [] },
  "error": null,
  "meta": {}
}
```

### 5.4 Filtering & Sorting Rules — Ditegakkan di Use-Case Layer

Karena payload AI disimpan sebagai **JSONB** utuh, aturan filtering tampilan (VAL-008, FR-016, FR-020, FR-021) ditegakkan di **use-case layer** (`get-analysis.use-case.ts`), **bukan** di query SQL. Alasan: logika filter bergantung pada nilai di dalam JSONB dan lebih mudah diuji sebagai fungsi murni, serta menjaga repository tetap fokus pada akses data.

- `top_5_predictions`: filter `confidence > 0.05` → sort menurun → ambil maksimal 5 item (FR-016).
- `career_recommendations`: filter `match_score > 0.3` → sort menurun berdasarkan `match_score` (FR-020).
- `matched_skills` per kategori: sort menurun berdasarkan `similarity` (FR-017, FR-021).
- Bila hasil filter kosong → kembalikan **array kosong** (bukan error); frontend menampilkan empty state (UI-013, VAL-008).

> **Pembagian tanggung jawab dengan frontend:** Backend menegakkan aturan filter sebagai otoritas data (sesuai PRD §10 "BE memvalidasi, FE menampilkan"). Frontend (`utils/filter.ts`, `utils/sort.ts` pada SDD Frontend) juga menerapkan aturan yang sama sebagai lapisan pertahanan tampilan. Keduanya memakai ambang identik (0.05 dan 0.3) sehingga hasil konsisten (NFR-020).


---

## BAB 6 — Desain Keamanan

### 6.1 Alur Autentikasi & Otorisasi

Setiap request ke endpoint privat menempuh alur berikut, dengan ownership enforcement ganda (middleware + SQL):

```
Client → Request + header "Authorization: Bearer <token>"
   │
   ▼
[auth.middleware]  extract token → tokenManager.verify(token)
   │  sukses → req.user = { id, email }    | gagal → AuthenticationError (401)
   ▼
[Controller]  baca req.user.id (tidak percaya body untuk identitas pemilik)
   │
   ▼
[Use-Case]  gunakan userId untuk validasi domain & ownership check
   │  (mis. cv.user_id !== userId → AuthorizationError 403, SEC-003)
   ▼
[Repository]  query parameterized: ... WHERE user_id = $1   (ownership di level SQL)
```

Prinsip kunci: **identitas pemilik selalu berasal dari `req.user` (hasil verifikasi JWT), tidak pernah dari body/query** yang dapat dimanipulasi klien (SEC-003, DATA-007).

### 6.2 Strategi Password Hashing (SEC-001, NFR-005)

- **Algoritma:** bcrypt dengan `saltRounds = 12`.
- **Alasan 12 rounds:** keseimbangan keamanan vs performa (≈200–300 ms per hash pada hardware modern) — cukup lambat untuk menghambat brute-force, cukup cepat untuk UX login/register.
- **`password_hash` tidak pernah dikembalikan** dalam response. Seluruh query `SELECT` yang mengembalikan user **mengeksplisitkan kolom** (`id, email, full_name, created_at`) dan **tidak** memakai `SELECT *`. Hanya `auth.repository.findByEmail()` (untuk login) yang menyertakan `password_hash`, dan use-case login membuang field tersebut sebelum return.

### 6.3 JWT Strategy (SEC-002, SEC-004, NFR-006)

- **Payload minimal:** `{ id, email, iat, exp }` — tanpa data sensitif (tanpa password/role berlebih).
- **Secret:** `config.JWT_SECRET`, divalidasi minimal 32 karакter saat startup (fail-fast).
- **Expiry:** `config.JWT_EXPIRES_IN` (default `7d`).
- **Tanpa refresh token pada MVP** — logout dilakukan dengan menghapus token di sisi klien (SDD Frontend §15.6). Token kedaluwarsa ditolak otomatis oleh `verify()` (SEC-004). Catatan evolusi: untuk invalidasi server-side, dapat ditambah daftar-hitam (blacklist) token atau rotasi refresh token.

### 6.4 Rate Limiting (SEC-008, NFR-008)

- **Global (`globalLimiter`):** seluruh endpoint, `windowMs = RATE_LIMIT_WINDOW_MS` (default 15 menit), `max = RATE_LIMIT_MAX` (default 100). Dipasang di `app.ts` sebelum router.
- **Ketat (`strictLimiter`):** endpoint sensitif `POST /auth/login`, `POST /auth/register`, dan `POST /cvs/:cvId/analyze` — `max = 10` per window. Mencegah brute-force kredensial dan penyalahgunaan endpoint AI yang berbiaya.
- **Override per-route:** dengan memasang instance limiter terpisah pada chain route tertentu (mis. `router.post('/login', strictLimiter, ...)`). Respons 429 mengikuti format `{ data: null, error: { message: 'Too many requests' }, meta: {} }`.

### 6.5 Input Validation Chain (SEC-005, SEC-006, NFR-007)

Validasi berlapis dari terluar ke terdalam:

1. **Multer** (`upload.ts`) — memvalidasi tipe MIME & ukuran berkas **sebelum** body diproses (VAL-004).
2. **Zod middleware** (`validate.ts`) — memvalidasi `body`/`params`/`query` di route level; gagal → `ClientError` 422 dengan `details` per field (VAL-001..006).
3. **Business rule** (use-case) — validasi domain: cek duplikat email (409), cek kepemilikan (403), panjang teks hasil ekstraksi (VAL-003).
4. **Parameterized query** (repository) — seluruh nilai input dikirim sebagai parameter `$1, $2, ...`, mencegah SQL injection (SEC-006).

### 6.6 Proteksi Komunikasi & Rahasia (SEC-009, SEC-010)

- **HTTPS** di produksi untuk FE↔BE dan BE↔AI (SEC-009). Backend tidak meng-*enforce* TLS pada level aplikasi (di-terminate oleh platform/proxy), namun `AI_BASE_URL` produksi wajib `https://`.
- **Secrets via env** (SEC-010): `JWT_SECRET`, `DATABASE_URL`, `AI_BASE_URL` hanya dari environment, tidak di-hardcode, dan tidak di-commit (lihat `.env.example` Bab 9). `config/index.ts` memastikan keberadaannya saat startup.

---

## BAB 7 — Desain Penanganan Error & Resiliensi

### 7.1 Error Handling Architecture

Seluruh controller memakai pola `try/catch` yang mendelegasikan error ke error middleware terpusat:

```typescript
async register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await this.registerUseCase.execute(req.body);
    res.status(201).json(response.success(user));
  } catch (err) {
    next(err); // delegasi ke middlewares/error.ts
  }
}
```

`middlewares/error.ts` membedakan **known error** (`HttpException` → gunakan `statusCode` + pesan) vs **unknown error** (`Error` lain → log penuh + 500 generik). Pola ini memastikan:
- Tidak ada `try/catch` yang menelan error secara diam-diam.
- Respons error selalu konsisten `{ data, error, meta }` (NFR-021).
- Detail teknis (stack trace) tidak bocor ke klien (SEC), namun tercatat di log (NFR-022).

### 7.2 Resiliensi AI Gateway (FR-013, NFR-009)

Tiga skenario kegagalan AI ditangani di `HttpAiGateway` dan diorkestrasi oleh `trigger-analysis.use-case` (status `failed` selalu dicatat sebelum melempar ulang):

| Skenario | Deteksi | Status Analysis | HTTP Response | Aksi Frontend |
|---|---|---|---|---|
| **AI Timeout** | `axios` `ECONNABORTED` / melewati `AI_TIMEOUT_MS` | `failed` | **504** | Tampilkan pesan timeout + tombol "Coba lagi" |
| **AI Error 5xx** | `axios` `response.status >= 500` | `failed` | **502** | Tampilkan fallback + retry |
| **Respons Invalid** | Zod `AiResponseSchema` gagal parse | `failed` | **422** | Tampilkan "Analisis gagal" |
| **Sukses** | Zod parse lolos | `success` | **200** | Redirect ke `/analysis/:id` |

Prinsip **graceful degradation**: kegagalan AI **tidak pernah** meng-crash proses (NFR-009, BR-7). Record analisis selalu dibuat sebagai `pending` lebih dahulu (§3.7.4) sehingga kegagalan dapat ditandai `failed` dan ditelusuri. Retry dikendalikan pengguna dari frontend (memanggil ulang `POST /cvs/:cvId/analyze`); backend tidak melakukan retry otomatis pada MVP untuk menghindari beban ganda ke layanan AI. *Circuit breaker* dicatat sebagai evolusi bila volume kegagalan tinggi.

### 7.3 Graceful Startup & Shutdown

**Startup (`server.ts`):**
```
1. import config            → validasi env (Zod); gagal → process.exit(1)
2. init pg.Pool             → config/database.ts
3. test koneksi DB          → await pool.query('SELECT 1'); gagal → log + exit(1)
4. const app = createApp()  → app.ts (mount middleware + routes)
5. server = app.listen(PORT)→ logger.info('listening on PORT')
```

**Shutdown (SIGTERM / SIGINT):**
```
1. logger.info('shutting down')
2. server.close()           → berhenti menerima koneksi baru, tunggu in-flight selesai
3. await pool.end()         → tutup seluruh koneksi DB
4. process.exit(0)
```
Penanganan sinyal memastikan tidak ada koneksi DB yang menggantung saat redeploy (NFR-010, NFR-012).

### 7.4 Logging Strategy (NFR-022)

Menggunakan Pino dengan **correlation ID** per request (`req.id` via `nanoid`, dipasang sebagai middleware awal):

| Level | Kapan dipakai |
|---|---|
| `info` | Setiap request masuk & selesai (method, path, status, durasi, `reqId`). |
| `warn` | Validasi respons AI gagal, percobaan retry, rate limit terlampaui. |
| `error` | Unknown error, kegagalan query DB, `AiGatewayError` (dengan stack trace & `reqId`). |

**Aturan privasi log:** **dilarang** mencatat `password`, `password_hash`, atau token JWT. `reqId` memudahkan korelasi seluruh log dalam satu request lintas lapisan.

---

## BAB 8 — Desain Pengujian

### 8.1 Strategi Testing

Mengikuti piramida pengujian:

- **Unit tests (`tests/unit/`):** menguji use-case dan utility secara terisolasi dengan **mock repository** dan **mock AI gateway** (memanfaatkan DI manual, §2.3.2). Tidak menyentuh DB/jaringan. Cepat dan deterministik. Framework: **Jest** (atau Vitest).
- **Integration tests (`tests/integration/`):** menguji endpoint end-to-end memakai **Supertest** terhadap database test PostgreSQL nyata. AI gateway memakai **mock adapter** (`USE_MOCK_AI=true`) agar deterministik. Setiap suite melakukan setup & teardown data.

### 8.2 Test Cases Kritis

**Auth:**
- Register sukses → 201, response **tidak** memuat `password`/`password_hash`.
- Register email duplikat → 409 (`ConflictError`).
- Login kredensial valid → 200 + `token` + `user`.
- Login kredensial salah → 401 dengan pesan generik (tidak menyebut field mana).
- Akses endpoint privat tanpa token → 401.

**CVs:**
- Upload teks valid (≥100 karakter) → 201 + `cv_id`.
- Upload teks < minimum → 422.
- Hapus CV milik sendiri → 200/204.
- Hapus CV milik orang lain → 403 (`AuthorizationError`).
- Upload berkas tipe tidak didukung → 422 (filter Multer/ClientError).

**Analyses (mock AI):**
- Trigger sukses → 200 + payload lengkap sesuai kontrak; status analysis `success`.
- Trigger AI timeout → 504; status analysis `failed`.
- Trigger AI error 5xx → 502; status analysis `failed`.
- Trigger respons AI invalid → 422; status analysis `failed`.
- Get analisis milik orang lain → 403.
- Aturan filter: item `confidence ≤ 0.05` tidak muncul di `top_5_predictions`; `career_recommendations` ≤ 0.3 tidak muncul; `matched_skills` terurut menurun.

### 8.3 Contoh Unit Test (Template)

```typescript
// tests/unit/auth.use-case.test.ts
import { createRegisterUseCase } from '@/services/auth/use-cases/register.use-case';
import { ConflictError } from '@/exceptions';

describe('register.use-case', () => {
  const baseRepo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  const passwordManager = { hash: jest.fn().mockResolvedValue('hashed') };

  beforeEach(() => jest.clearAllMocks());

  it('menolak email duplikat dengan ConflictError (FR-001)', async () => {
    baseRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    const useCase = createRegisterUseCase({ authRepo: baseRepo, passwordManager });

    await expect(
      useCase.execute({ full_name: 'A', email: 'a@b.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(baseRepo.createUser).not.toHaveBeenCalled();
  });

  it('membuat user & tidak mengembalikan password_hash (SEC-001)', async () => {
    baseRepo.findByEmail.mockResolvedValue(null);
    baseRepo.createUser.mockResolvedValue({
      id: 'u2', email: 'c@d.com', full_name: 'C', created_at: '2026-05-30T08:00:00Z',
    });
    const useCase = createRegisterUseCase({ authRepo: baseRepo, passwordManager });

    const user = await useCase.execute({ full_name: 'C', email: 'c@d.com', password: 'secret123' });
    expect(passwordManager.hash).toHaveBeenCalledWith('secret123');
    expect(user).not.toHaveProperty('password_hash');
  });
});
```

### 8.4 Test Setup

- **`.env.test`** terpisah menunjuk ke database test khusus dan `USE_MOCK_AI=true`.
- **`beforeAll`:** jalankan migrasi (`npm run migrate`) ke DB test.
- **`afterEach`:** `TRUNCATE users, cvs, analyses RESTART IDENTITY CASCADE` (mempertahankan schema, mereset data antar test).
- **`afterAll`:** tutup koneksi (`pool.end()`).
- AI gateway selalu di-mock pada unit test (DI manual); pada integration test memakai mock adapter melalui env, sehingga seluruh alur FE/BE dapat diuji tanpa layanan AI nyata (FR-015).


---

## BAB 9 — Deployment & Konfigurasi Environment

### 9.1 Environment Variables

| Variabel | Tipe | Wajib | Default | Deskripsi |
|---|---|---|---|---|
| `NODE_ENV` | string | Ya | `development` | `development` / `production` / `test` |
| `PORT` | number | Ya | `3000` | Port HTTP server |
| `DATABASE_URL` | string | Ya | — | Connection string PostgreSQL |
| `JWT_SECRET` | string | Ya | — | Secret signing JWT, **min 32 karakter** |
| `JWT_EXPIRES_IN` | string | Tidak | `7d` | Masa berlaku token JWT |
| `AI_BASE_URL` | string | Ya* | — | Base URL layanan AI (*wajib bila `USE_MOCK_AI=false`) |
| `AI_TIMEOUT_MS` | number | Tidak | `30000` | Timeout call ke AI (ms), NFR-003 |
| `USE_MOCK_AI` | boolean | Tidak | `false` | Gunakan mock adapter bila `true` (FR-015) |
| `ALLOWED_ORIGINS` | string | Ya | — | Origin CORS yang diizinkan (comma-separated) |
| `MAX_FILE_SIZE_MB` | number | Tidak | `5` | Batas ukuran berkas upload |
| `RATE_LIMIT_WINDOW_MS` | number | Tidak | `900000` | Window rate limit (15 menit) |
| `RATE_LIMIT_MAX` | number | Tidak | `100` | Maksimum request per window |
| `LOG_LEVEL` | string | Tidak | `info` | Level logging Pino |

Contoh `.env.example` (wajib dikomit, tanpa nilai rahasia):

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/pathora
JWT_SECRET=ganti-dengan-secret-minimal-32-karakter-acak
JWT_EXPIRES_IN=7d
AI_BASE_URL=http://localhost:8000
AI_TIMEOUT_MS=30000
USE_MOCK_AI=true
ALLOWED_ORIGINS=http://localhost:5173
MAX_FILE_SIZE_MB=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=debug
```

### 9.2 Scripts NPM

| Script | Perintah | Kegunaan |
|---|---|---|
| `dev` | `ts-node-dev --respawn src/server.ts` | Hot reload pengembangan |
| `build` | `tsc` | Kompilasi TypeScript → `dist/` |
| `start` | `node dist/server.js` | Menjalankan build production |
| `migrate` | `node scripts/migrate.js` | Eksekusi seluruh file SQL di `migrations/` berurutan |
| `lint` | `eslint src --ext .ts` | Lint kode (NFR-016) |
| `test` | `jest --runInBand` | Seluruh test (serial, untuk DB integration) |
| `test:unit` | `jest tests/unit` | Hanya unit test |
| `test:integration` | `jest tests/integration` | Hanya integration test |

> **Catatan:** `--runInBand` dipakai agar integration test tidak berebut state DB (eksekusi serial).

### 9.3 Deployment Target

- **Platform:** Railway / Render / Fly.io (mendukung Node + PostgreSQL terkelola) — selaras PRD §5.1, BR-10.
- **Prasyarat:** Node.js ≥ 20, PostgreSQL ≥ 15.
- **Build command:** `npm run build`.
- **Start command:** `npm start`.
- **Migration:** dijalankan sebagai *release/pre-deploy command* (`npm run migrate`) sebelum start, agar schema selalu mutakhir.
- **Health check:** `GET /api/v1/health` dijadikan probe monitoring platform (NFR-010, NFR-022).
- **HTTPS:** di-terminate oleh platform; `ALLOWED_ORIGINS` & `AI_BASE_URL` produksi memakai `https://` (SEC-009).

---

## BAB 10 — Traceability Matrix SDD ↔ SRS

| ID SRS | Deskripsi | Komponen SDD |
|---|---|---|
| FR-001 | Registrasi pengguna | `auth/use-cases/register.use-case.ts`, `auth/repositories/auth.repository.ts`, `security/password-manager.ts` |
| FR-002 | Login + JWT | `auth/use-cases/login.use-case.ts`, `security/token-manager.ts` |
| FR-003 | Logout & sesi | Stateless JWT; invalidasi sisi klien (FE). Token expiry via `token-manager` |
| FR-004 | Proteksi endpoint privat | `middlewares/auth.ts` |
| FR-005 | Ringkasan analisis terakhir | `dashboard/use-cases/get-dashboard.use-case.ts`, `dashboard.repository.getLastAnalysis` |
| FR-006 | CTA Upload (data jalur) | `dashboard/` (data), navigasi di FE |
| FR-007 | Riwayat upload | `dashboard.repository.getRecentHistory`, `analyses.repository.findByUser` |
| FR-008 | Upload CV teks | `cvs/use-cases/upload-cv-text.use-case.ts`, `cvs/validators/cvs.schema.ts` |
| FR-009 | Upload CV file | `cvs/use-cases/upload-cv-file.use-case.ts`, `middlewares/upload.ts`, `utils/extract-text.ts` |
| FR-010 | Validasi & loading upload | `middlewares/validate.ts`, `middlewares/upload.ts` (BE); loading state di FE |
| FR-011 | Pemicuan analisis pasca-upload | `analyses/use-cases/trigger-analysis.use-case.ts`, `cvs.route.ts` (`POST /cvs/:cvId/analyze`) |
| FR-012 | Daftar & hapus CV | `cvs/use-cases/list-cvs.use-case.ts`, `delete-cv.use-case.ts`, `cvs.repository.ts` |
| FR-013 | Orkestrasi analisis & resiliensi | `analyses/use-cases/trigger-analysis.use-case.ts`, `services/ai-gateway/`, `exceptions/ai-gateway-error.ts` |
| FR-014 | Penyimpanan hasil analisis | `analyses/repositories/analyses.repository.ts`, kolom `result` JSONB |
| FR-015 | Mock adapter AI | `ai-gateway/ai-gateway.mock.ts`, `ai-gateway/ai-gateway.factory.ts` |
| FR-016 | Top 5 predictions (>0.05) | `get-analysis.use-case.ts` (filter), kontrak `analyses/:id` |
| FR-017 | Skill gap (sort by similarity) | `get-analysis.use-case.ts` (sort matched_skills desc) |
| FR-018 | Deskripsi karir | `result.description_career_recommendations` (JSONB) |
| FR-019 | Navigasi ke rekomendasi karir | Endpoint sama `GET /analyses/:analysisId`; navigasi di FE |
| FR-020 | Seluruh kategori (>0.3) | `get-analysis.use-case.ts` (filter career_recommendations) |
| FR-021 | Skill gap per kategori | `get-analysis.use-case.ts` (gabung extracted_skills, sort) |
| FR-022 | Lihat & edit biodata | `users/use-cases/get-profile.use-case.ts`, `update-profile.use-case.ts` |
| FR-023 | Riwayat analisis di Profile | `analyses/use-cases/list-analyses.use-case.ts`, `GET /analyses` |
| FR-024 | Data referensi kategori | `categories/` (+ cache in-memory), `categories.repository.findAll` |
| FR-025 | Health check | `health/health.controller.ts`, `health.route.ts` |
| NFR-002 | Latensi endpoint non-AI | `config/database.ts` (pool), index DB; query parameterized ringan |
| NFR-003 | Timeout endpoint analyze | `config/index.ts` (`AI_TIMEOUT_MS`), `ai-gateway/ai-gateway.http.ts` |
| NFR-005 | Password hashing | `security/password-manager.ts` (bcrypt, saltRounds=12) |
| NFR-006 | Autentikasi JWT | `security/token-manager.ts`, `middlewares/auth.ts` |
| NFR-007 | Validasi input + parameterized query | `middlewares/validate.ts`, seluruh `*.repository.ts` |
| NFR-008 | CORS + rate limiting | `middlewares/cors.ts`, `middlewares/rate-limit.ts` |
| NFR-009 | Resiliensi kegagalan AI | `ai-gateway/ai-gateway.http.ts`, `trigger-analysis.use-case.ts` (try/catch, status failed) |
| NFR-010 | Ketersediaan & health | `health/`, graceful startup/shutdown (`server.ts`) |
| NFR-011 | Skalabilitas data & index | `migrations/005_add_indexes.sql` |
| NFR-012 | Stateless API | JWT stateless; tidak ada session in-memory |
| NFR-018 | Fleksibilitas skema hasil AI | Kolom `result` JSONB + `AiResponseSchema` (Zod) |
| NFR-020 | Konsistensi kontrak integrasi | `ai-response.schema.ts`, mock = nyata (validator sama) |
| NFR-021 | Response konsisten | `utils/response.ts`, `middlewares/error.ts` |
| NFR-022 | Logging & observability | `config/logger.ts` (Pino), `reqId` correlation, `/health` |
| SEC-001 | Hash password | `security/password-manager.ts` |
| SEC-002 | Autentikasi JWT | `middlewares/auth.ts`, `security/token-manager.ts` |
| SEC-003 | Otorisasi kepemilikan | Ownership check di use-case (cvs/analyses) + `WHERE user_id=$1` |
| SEC-004 | Manajemen token | `token-manager` (expiry), logout sisi klien |
| SEC-005 | Validasi & sanitasi input | `middlewares/validate.ts` (Zod) |
| SEC-006 | Proteksi injeksi | Parameterized queries di semua repository |
| SEC-007 | CORS | `middlewares/cors.ts` |
| SEC-008 | Rate limiting | `middlewares/rate-limit.ts` (global + strict) |
| SEC-009 | Proteksi komunikasi (HTTPS) | Deployment (`ALLOWED_ORIGINS`/`AI_BASE_URL` https) |
| SEC-010 | Pengelolaan secrets | `config/index.ts` (env-only, fail-fast) |
| SEC-011 | Isolasi AI dari FE | AI hanya dipanggil dari `services/ai-gateway/` di backend |
| VAL-001 | Validasi registrasi | `auth/validators/auth.schema.ts` (`RegisterSchema`) |
| VAL-002 | Validasi login | `auth/validators/auth.schema.ts` (`LoginSchema`) |
| VAL-003 | Validasi upload teks | `cvs/validators/cvs.schema.ts` (`UploadCvTextSchema`, min 100) |
| VAL-004 | Validasi upload berkas | `middlewares/upload.ts` (MIME + size) |
| VAL-005 | Validasi edit biodata | `users/validators/users.schema.ts` (`UpdateProfileSchema`) |
| VAL-006 | Validasi parameter & path | `CvIdParamSchema`, `utils/pagination.ts` |
| VAL-007 | Validasi respons AI | `services/ai-gateway/ai-response.schema.ts`, `utils/ai-schema-validator.ts` |
| VAL-008 | Aturan filtering tampilan | `get-analysis.use-case.ts` (filter/sort di use-case layer) |
| DATA-001 | Data User | `migrations/001_create_users.sql` |
| DATA-002 | Data CV | `migrations/002_create_cvs.sql` |
| DATA-003 | Data Analisis | `migrations/003_create_analyses.sql`, kolom JSONB `result` |
| DATA-004 | Data Kategori | `migrations/004_create_categories.sql` |
| DATA-005 | Payload hasil (kontrak) | `ai-response.schema.ts`, kolom `result` |
| DATA-006 | Integritas & relasi | FK `ON DELETE CASCADE`, index (`005`) |
| DATA-007 | Retensi & kepemilikan | Ownership check + `WHERE user_id=$1` di repository |

---

## BAB 11 — Keputusan Desain & Alternatif yang Dipertimbangkan

### 11.1 ORM vs Raw SQL (`pg`)

- **Konteks:** Akses data ke PostgreSQL.
- **Alternatif:** Prisma/Drizzle (ORM, type-safe, migrasi otomatis) vs `pg` (driver, query manual).
- **Keputusan:** **`pg` + raw parameterized SQL**.
- **Alasan & trade-off:** Skema sederhana (4 tabel), kebutuhan JSONB & GIN index lebih lugas ditulis langsung dalam SQL, kontrol penuh atas query untuk performa (NFR-002, NFR-011), dan dependensi lebih ringan. Trade-off: kehilangan type-safety otomatis ORM — dimitigasi dengan DTO/type eksplisit di repository dan pengujian. Untuk skala lebih besar/tim besar, migrasi ke Drizzle dapat dipertimbangkan tanpa mengubah arsitektur (repository tetap menjadi batas abstraksi).

### 11.2 In-memory Cache vs Redis untuk Kategori

- **Konteks:** Endpoint `GET /categories` mengembalikan data statis (FR-024).
- **Alternatif:** Cache in-memory pada variabel modul vs Redis terdistribusi.
- **Keputusan:** **Cache in-memory** (permanen hingga restart).
- **Alasan & trade-off:** Data kategori jarang berubah dan kecil; Redis menambah infrastruktur tanpa manfaat berarti pada MVP. Trade-off: pada deployment multi-instance, tiap instance punya cache sendiri (tetap konsisten karena sumber data sama, dan invalidasi via restart/redeploy). Bila kategori menjadi dinamis, beralih ke Redis atau cache ber-TTL.

### 11.3 Sync vs Async untuk Trigger Analisis

- **Konteks:** `POST /cvs/:cvId/analyze` memanggil layanan AI yang berlatensi beberapa detik (BTS-02).
- **Alternatif:** Synchronous (request menunggu hasil) vs Asynchronous (job queue + polling/webhook).
- **Keputusan:** **Synchronous** untuk MVP, dengan timeout konfigurabel (`AI_TIMEOUT_MS`, NFR-003) dan record `pending` sebagai jejak.
- **Alasan & trade-off:** Menyederhanakan FE (await langsung, lihat SDD Frontend §19) dan BE (tanpa infrastruktur queue). Trade-off: request panjang menahan koneksi; dimitigasi timeout 504 + retry pengguna. Catatan skalabilitas: bila throughput meningkat, beralih ke async (BullMQ/queue) dengan status `pending` di-polling via `GET /cvs/:cvId/analysis` — struktur status (`pending/success/failed`) sudah disiapkan untuk transisi ini.

### 11.4 Manual DI vs Framework DI

- **Konteks:** Injeksi dependensi (repository, gateway) ke use-case.
- **Alternatif:** InversifyJS/tsyringe (container DI) vs DI manual (factory function/constructor).
- **Keputusan:** **DI manual**.
- **Alasan & trade-off:** Jumlah dependensi kecil dan eksplisit; container DI menambah kompleksitas, dekorator, dan metadata reflektif yang tidak sebanding manfaatnya pada skala ini. DI manual tetap memberi keuntungan utama (mock saat test, Bab 8). Trade-off: wiring manual di titik komposisi (route/bootstrap) — dapat diterima dan transparan.

### 11.5 Status `pending` pada Analyses

- **Konteks:** Pencatatan analisis sebelum hasil AI tersedia.
- **Keputusan:** Membuat record `analyses` berstatus **`pending` lebih dahulu**, sebelum memanggil AI.
- **Alasan:** (1) **Tracking** — setiap percobaan analisis tercatat dan dapat diaudit; (2) **Error recovery** — bila AI gagal, status diubah `failed` (bukan record hilang), mendukung resiliensi & diagnosa (FR-013, NFR-022); (3) **Kesiapan async** — memungkinkan transisi ke pemrosesan asinkron tanpa perubahan schema (§11.3). Trade-off: satu operasi tulis tambahan per analisis — dapat diabaikan dibanding manfaat ketertelusuran.

---

## Lampiran A — Daftar File & Tanggung Jawab

| Path File                                                       | Tanggung Jawab (1 kalimat)                                                | Layer              | ID SRS                  |
| -----------------------------------------------------------------| ---------------------------------------------------------------------------| --------------------| -------------------------|
| `src/app.ts`                                                    | Membuat instance Express dan memasang middleware global + router.         | Bootstrap          | NFR-021                 |
| `src/server.ts`                                                 | Entry point: validasi env, init pool, test DB, listen, graceful shutdown. | Bootstrap          | NFR-010                 |
| `src/config/index.ts`                                           | Memuat & memvalidasi env var dengan Zod (fail-fast).                      | Config             | SEC-010                 |
| `src/config/database.ts`                                        | Inisialisasi `pg.Pool` & wrapper `query()`.                               | Config             | NFR-002, NFR-011        |
| `src/config/logger.ts`                                          | Setup logger Pino per environment.                                        | Config             | NFR-022                 |
| `src/exceptions/base-error.ts`                                  | Kelas dasar `HttpException` (statusCode, message, details).               | Exception          | NFR-021                 |
| `src/exceptions/authentication-error.ts`                        | Error 401.                                                                | Exception          | SEC-002                 |
| `src/exceptions/authorization-error.ts`                         | Error 403.                                                                | Exception          | SEC-003                 |
| `src/exceptions/not-found-error.ts`                             | Error 404.                                                                | Exception          | —                       |
| `src/exceptions/client-error.ts`                                | Error 400/422 (validasi).                                                 | Exception          | SEC-005                 |
| `src/exceptions/conflict-error.ts`                              | Error 409 (duplikat).                                                     | Exception          | FR-001                  |
| `src/exceptions/invariant-error.ts`                             | Error 422 (assertion domain).                                             | Exception          | VAL-007                 |
| `src/exceptions/ai-gateway-error.ts`                            | Error AI 502/504/422 berdasarkan `type`.                                  | Exception          | FR-013                  |
| `src/middlewares/auth.ts`                                       | Verifikasi JWT & set `req.user`.                                          | Middleware         | FR-004, SEC-002         |
| `src/middlewares/error.ts`                                      | Error handler global terpusat.                                            | Middleware         | NFR-021                 |
| `src/middlewares/validate.ts`                                   | Factory validasi Zod per source.                                          | Middleware         | SEC-005, VAL-*          |
| `src/middlewares/rate-limit.ts`                                 | Limiter global & strict.                                                  | Middleware         | SEC-008                 |
| `src/middlewares/cors.ts`                                       | Kebijakan CORS dari env.                                                  | Middleware         | SEC-007                 |
| `src/middlewares/upload.ts`                                     | Multer memoryStorage + filter MIME/size.                                  | Middleware         | FR-009, VAL-004         |
| `src/routes/index.ts`                                           | Mount seluruh domain router ke `/api/v1`.                                 | Route              | API-*                   |
| `src/security/token-manager.ts`                                 | Sign/verify JWT.                                                          | Security           | SEC-002                 |
| `src/security/password-manager.ts`                              | Hash/compare bcrypt.                                                      | Security           | SEC-001                 |
| `src/utils/response.ts`                                         | Helper `{ data, error, meta }`.                                           | Util               | NFR-021                 |
| `src/utils/pagination.ts`                                       | Parse limit/offset + meta.                                                | Util               | VAL-006                 |
| `src/utils/extract-text.ts`                                     | Ekstraksi teks PDF/DOCX.                                                  | Util               | FR-009                  |
| `src/utils/ai-schema-validator.ts`                              | Validasi payload AI (Zod).                                                | Util               | VAL-007                 |
| `src/services/auth/routes/auth.route.ts`                        | Definisi route auth.                                                      | Route              | API-001, API-002        |
| `src/services/auth/controllers/auth.controller.ts`              | Controller register/login.                                                | Controller         | FR-001, FR-002          |
| `src/services/auth/use-cases/register.use-case.ts`              | Logika registrasi.                                                        | UseCase            | FR-001                  |
| `src/services/auth/use-cases/login.use-case.ts`                 | Logika login + token.                                                     | UseCase            | FR-002                  |
| `src/services/auth/repositories/auth.repository.ts`             | Query users (auth).                                                       | Repository         | DATA-001                |
| `src/services/auth/validators/auth.schema.ts`                   | Schema register/login.                                                    | UseCase(Validator) | VAL-001, VAL-002        |
| `src/services/users/controllers/users.controller.ts`            | Controller profil.                                                        | Controller         | FR-022                  |
| `src/services/users/use-cases/get-profile.use-case.ts`          | Ambil profil.                                                             | UseCase            | FR-022, API-003         |
| `src/services/users/use-cases/update-profile.use-case.ts`       | Update profil + cek email unik.                                           | UseCase            | FR-022, API-004         |
| `src/services/users/repositories/users.repository.ts`           | Query users (profil).                                                     | Repository         | DATA-001                |
| `src/services/users/validators/users.schema.ts`                 | Schema update profil.                                                     | UseCase(Validator) | VAL-005                 |
| `src/services/cvs/controllers/cvs.controller.ts`                | Controller CV (upload/list/get/delete).                                   | Controller         | FR-008..FR-012          |
| `src/services/cvs/use-cases/upload-cv-text.use-case.ts`         | Simpan CV teks.                                                           | UseCase            | FR-008                  |
| `src/services/cvs/use-cases/upload-cv-file.use-case.ts`         | Ekstrak & simpan CV berkas.                                               | UseCase            | FR-009                  |
| `src/services/cvs/use-cases/delete-cv.use-case.ts`              | Hapus CV + cek kepemilikan.                                               | UseCase            | FR-012, SEC-003         |
| `src/services/cvs/use-cases/list-cvs.use-case.ts`               | Daftar CV pengguna.                                                       | UseCase            | FR-012                  |
| `src/services/cvs/repositories/cvs.repository.ts`               | Query cvs.                                                                | Repository         | DATA-002                |
| `src/services/cvs/validators/cvs.schema.ts`                     | Schema upload teks & param cvId.                                          | UseCase(Validator) | VAL-003, VAL-006        |
| `src/services/analyses/controllers/analyses.controller.ts`      | Controller analisis (trigger/get/list).                                   | Controller         | FR-013..FR-014          |
| `src/services/analyses/use-cases/trigger-analysis.use-case.ts`  | Orkestrasi analisis + resiliensi.                                         | UseCase            | FR-013, NFR-009         |
| `src/services/analyses/use-cases/get-analysis.use-case.ts`      | Ambil analisis + filter/sort.                                             | UseCase            | FR-016..FR-021, VAL-008 |
| `src/services/analyses/use-cases/list-analyses.use-case.ts`     | Riwayat analisis.                                                         | UseCase            | FR-023, API-012         |
| `src/services/analyses/repositories/analyses.repository.ts`     | Query analyses (CRUD + JSONB).                                            | Repository         | DATA-003, FR-014        |
| `src/services/analyses/validators/analyses.schema.ts`           | Schema param analysisId.                                                  | UseCase(Validator) | VAL-006                 |
| `src/services/ai-gateway/ai-gateway.adapter.ts`                 | Interface `AiGatewayAdapter`.                                             | Gateway            | NFR-020                 |
| `src/services/ai-gateway/ai-gateway.http.ts`                    | Implementasi HTTP (axios) + error mapping.                                | Gateway            | FR-013, NFR-003         |
| `src/services/ai-gateway/ai-gateway.mock.ts`                    | Implementasi mock sesuai kontrak.                                         | Gateway            | FR-015                  |
| `src/services/ai-gateway/ai-gateway.factory.ts`                 | Pilih implementasi via `USE_MOCK_AI`.                                     | Gateway            | BTS-03                  |
| `src/services/ai-gateway/ai-response.schema.ts`                 | Schema Zod API Contract.                                                  | Gateway            | VAL-007, DATA-005       |
| `src/services/dashboard/controllers/dashboard.controller.ts`    | Controller dashboard.                                                     | Controller         | FR-005..FR-007          |
| `src/services/dashboard/use-cases/get-dashboard.use-case.ts`    | Agregasi data dashboard (parallel).                                       | UseCase            | FR-005, API-005         |
| `src/services/dashboard/repositories/dashboard.repository.ts`   | Query last analysis & history.                                            | Repository         | FR-007                  |
| `src/services/categories/controllers/categories.controller.ts`  | Controller kategori (+ cache).                                            | Controller         | FR-024                  |
| `src/services/categories/repositories/categories.repository.ts` | Query categories.                                                         | Repository         | DATA-004                |
| `src/services/health/health.controller.ts`                      | Cek DB & status layanan.                                                  | Controller         | FR-025, NFR-022         |
| `src/services/health/health.route.ts`                           | Route health.                                                             | Route              | API-015                 |
| `migrations/001_create_users.sql`                               | DDL tabel users.                                                          | Migration          | DATA-001                |
| `migrations/002_create_cvs.sql`                                 | DDL tabel cvs.                                                            | Migration          | DATA-002                |
| `migrations/003_create_analyses.sql`                            | DDL tabel analyses (JSONB).                                               | Migration          | DATA-003                |
| `migrations/004_create_categories.sql`                          | DDL + seed categories.                                                    | Migration          | DATA-004                |
| `migrations/005_add_indexes.sql`                                | Index performa + GIN.                                                     | Migration          | NFR-011, DATA-006       |
| `tests/unit/auth.use-case.test.ts`                              | Unit test use-case auth.                                                  | Test               | FR-001, FR-002          |
| `tests/unit/ai-gateway.test.ts`                                 | Unit test adapter & error mapping.                                        | Test               | FR-013, FR-015          |
| `tests/unit/zod-schemas.test.ts`                                | Unit test schema validasi.                                                | Test               | VAL-*, VAL-007          |
| `tests/integration/auth.integration.test.ts`                    | Integration test endpoint auth.                                           | Test               | API-001, API-002        |
| `tests/integration/cvs.integration.test.ts`                     | Integration test endpoint CV.                                             | Test               | API-006..API-009        |
| `tests/integration/analyses.integration.test.ts`                | Integration test endpoint analisis.                                       | Test               | API-010..API-013        |

---

## Lampiran B — Dependency NPM

| Package | Versi | Kategori | Kegunaan |
|---|---|---|---|
| `express` | ^4.x | Core | HTTP framework (BR-3) |
| `typescript` | ^5.x | Dev | Type system |
| `zod` | ^3.x | Core | Schema validation (VAL-*, VAL-007) |
| `pg` | ^8.x | Core | PostgreSQL client (BR-4) |
| `jsonwebtoken` | ^9.x | Core | JWT sign/verify (SEC-002) |
| `bcrypt` | ^5.x | Core | Password hashing (SEC-001) |
| `axios` | ^1.x | Core | HTTP client untuk AI gateway |
| `multer` | ^1.x | Core | Middleware upload berkas (FR-009) |
| `pdf-parse` | ^1.x | Core | Ekstraksi teks PDF |
| `mammoth` | ^1.x | Core | Ekstraksi teks DOCX |
| `pino` | ^9.x | Core | Logger JSON cepat (NFR-022) |
| `cors` | ^2.x | Core | Middleware CORS (SEC-007) |
| `express-rate-limit` | ^7.x | Core | Rate limiting (SEC-008) |
| `dotenv` | ^16.x | Core | Memuat env var |
| `nanoid` | ^5.x | Core | Correlation ID (`reqId`) untuk logging |
| `ts-node-dev` | ^2.x | Dev | Hot reload pengembangan |
| `jest` | ^29.x | Dev | Framework pengujian |
| `supertest` | ^6.x | Dev | Pengujian integrasi HTTP |
| `eslint` | ^8.x | Dev | Linting (NFR-016) |
| `prettier` | ^3.x | Dev | Formatting kode |
| `@types/express`, `@types/jsonwebtoken`, `@types/bcrypt`, `@types/multer`, `@types/pg`, `@types/supertest` | latest | Dev | Definisi tipe TypeScript |

---

*Dokumen ini diturunkan dari PRD Path`Ora v1.2, SRS Path`Ora v1.0, dan API Contract (`docs/contract-api-Ai.json`), serta diselaraskan dengan SDD Frontend v1.0. Seluruh keputusan desain backend mengacu pada ID kebutuhan (FR/NFR/SEC/VAL/DATA/API) dan konsisten dengan struktur folder `pathora-backend/` yang telah ditetapkan. Fitur F8 (Dashboard Agregat Admin) dikecualikan dari dokumen ini sesuai batasan scope. — 30 Mei 2026*
