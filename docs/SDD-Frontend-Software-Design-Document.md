# Software Design Document Frontend — Path`Ora

> **Software Design Document — Frontend**
> Platform End-to-End Kesiapan Kerja dengan Dashboard Strategis & Rekomendasi Jalur Karir Otomatis

| Field | Value |
|---|---|
| **Nama Produk** | Path`Ora |
| **Komponen** | Frontend (Single Page Application) |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 30 Mei 2026 |
| **Status** | Draft untuk Review |
| **Dokumen Acuan** | PRD Path`Ora v1.2, SRS Path`Ora v1.0 |
| **Lingkup** | Desain Teknis Frontend (React + TypeScript + Vite) |
| **Repository Frontend** | `pathora-frontend/` |

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Arsitektur Frontend](#2-arsitektur-frontend)
3. [Environment & Build Configuration](#3-environment--build-configuration)
4. [Struktur Folder Frontend](#4-struktur-folder-frontend)
5. [Data Flow Design](#5-data-flow-design)
6. [Routing Design](#6-routing-design)
7. [Page Design](#7-page-design)
8. [Component Design](#8-component-design)
9. [Layout Design](#9-layout-design)
10. [Type Design](#10-type-design)
11. [API Integration Design](#11-api-integration-design)
12. [Services Design](#12-services-design)
13. [Hooks Design](#13-hooks-design)
14. [Store Design](#14-store-design)
15. [Authentication Flow](#15-authentication-flow)
16. [Form Validation Design](#16-form-validation-design)
17. [Error Handling Design](#17-error-handling-design)
18. [Loading, Empty, Success, and Retry State](#18-loading-empty-success-and-retry-state)
19. [Analysis Result Handling](#19-analysis-result-handling)
20. [Utility Design](#20-utility-design)
21. [Testing Design](#21-testing-design)
22. [Security Considerations Frontend](#22-security-considerations-frontend)
23. [Performance and Scalability Plan](#23-performance-and-scalability-plan)
24. [Mapping SRS to Frontend Design](#24-mapping-srs-to-frontend-design)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen Software Design Document (SDD) Frontend ini merupakan **acuan teknis tunggal (single source of truth)** untuk implementasi sisi frontend aplikasi Path`Ora. Dokumen menerjemahkan kebutuhan produk (PRD v1.2) dan spesifikasi sistem (SRS v1.0) menjadi keputusan desain konkret pada level arsitektur komponen, routing, manajemen state, integrasi API, validasi, serta penanganan error dan state UI.

Tujuan spesifik dokumen ini:

1. Menetapkan struktur folder, konvensi penamaan, dan batasan tanggung jawab tiap lapisan (pages, components, hooks, services, store, utils, types) sehingga seluruh anggota tim menulis kode yang konsisten dan dapat diprediksi.
2. Mendefinisikan kontrak integrasi frontend ↔ backend (request/response, interceptor, error handling) yang selaras dengan API Requirements SRS §6 dan API Contract PRD §10.
3. Menjadi dasar penelusuran (traceability) antara requirement SRS (FR, NFR, UI, VAL, SEC) dengan artefak frontend (halaman, komponen, hook, service).
4. Menyediakan acuan pengujian dan kriteria keberhasilan implementasi frontend.

**Pembaca dokumen (audiens):**

| Pembaca | Penggunaan Dokumen |
|---|---|
| **Frontend Developer** | Acuan utama implementasi harian: struktur folder, kontrak komponen, hook, service, dan konvensi kode. |
| **Tech Lead / Frontend Architect** | Acuan review desain, penjaminan konsistensi arsitektur, dan pengambilan keputusan teknis. |
| **QA Engineer** | Acuan penyusunan skenario uji berbasis acceptance criteria SRS dan state UI (loading/empty/error). |
| **Backend Developer** | Acuan keselarasan kontrak API (bentuk request/response yang dikonsumsi frontend). |

### 1.2 Ruang Lingkup Frontend

Frontend Path`Ora adalah **Single Page Application (SPA)** responsif yang menyajikan halaman publik (Register, Login) dan halaman privat (Dashboard, Upload, Analysis, Career Recommendations, Profile), serta berkomunikasi dengan backend melalui REST API menggunakan Axios.

**Yang menjadi tanggung jawab frontend (in scope):**

- Rendering seluruh halaman dan komponen UI sesuai sitemap UI-001.
- Routing dan proteksi rute privat (UI-003, FR-004).
- Validasi input sisi klien menggunakan Zod untuk umpan balik cepat (VAL-001 s.d. VAL-005).
- Komunikasi data ke backend via Axios, termasuk attach token, interceptor, dan normalisasi error (NFR-021).
- Manajemen state autentikasi dan UI feedback secara global (Zustand), serta state domain secara lokal pada hook.
- Penyajian hasil analisis (Top 5 predictions, skill gap, rekomendasi karir) beserta aturan filtering tampilan (VAL-008, FR-016, FR-020).
- Penanganan loading, empty, error, retry, dan success state secara konsisten (NFR-014, UI-012 s.d. UI-015).
- Responsivitas lintas breakpoint (NFR-013) dan aksesibilitas dasar (NFR-015).

**Yang BUKAN tanggung jawab frontend (out of scope):**

- **Tidak** memanggil layanan AI/ML secara langsung. Seluruh komunikasi AI dilakukan melalui backend (BTS-04, SEC-011).
- **Tidak** mengakses database secara langsung; seluruh data diperoleh melalui REST API backend.
- **Tidak** melakukan parsing/ekstraksi teks dari berkas PDF/DOCX (dilakukan backend); frontend hanya memvalidasi tipe & ukuran berkas sebelum mengirim (VAL-004).
- **Tidak** menjadi otoritas validasi akhir; validasi otoritatif tetap di backend (SEC-005). Validasi frontend bersifat *fail-fast* untuk UX.
- **Tidak** menyimpan password dalam bentuk apa pun; hanya menyimpan JWT untuk sesi.
- **Tidak** menangani training/tuning model, pipeline data science, scraping, maupun pembayaran (sesuai batasan PRD §5.2).

### 1.3 Referensi Dokumen

| No | Dokumen | Lokasi | Relevansi |
|---|---|---|---|
| 1 | PRD — Path`Ora (Full Stack Development) v1.2 | `docs/PRD-Full-Stack-Development.md` | Tujuan produk, sitemap, fitur F1–F7, user flow, API Contract §10 |
| 2 | SRS — Software Requirements Specification v1.0 | `docs/SRS-Software-Requirements-Specification.md` | FR, NFR, UI, API, DATA, SEC, VAL, Use Case |
| 3 | API Contract Backend ↔ AI | PRD §10 / SRS DATA-005 | Bentuk payload hasil analisis yang dikonsumsi frontend |
| 4 | API Requirements | SRS §6 (API-001 s.d. API-015) | Endpoint, method, request/response, error case |
| 5 | Konvensi RESTful & HTTP Status (RFC 7231), JWT (RFC 7519) | Standar eksternal | Konvensi status code & token |

### 1.4 Tech Stack

| Kategori | Library / Tool | Versi | Alasan Pemilihan |
|---|---|---|---|
| UI Framework | React | 18 | Ekosistem matang, model komponen deklaratif, dukungan `Suspense`/`lazy` untuk code splitting (NFR-001). |
| Bahasa | TypeScript | 5 | Type-safety end-to-end, mengurangi runtime error, kontrak data eksplisit (NFR-016). |
| Build Tool | Vite | 5 | Dev server cepat (HMR), build teroptimasi, pemenuhan BR-1/BTS-07, mendukung path alias & env `VITE_`. |
| Routing | React Router | v6 | `createBrowserRouter`, nested routes, route guard deklaratif, `loader`/`state` navigation. |
| HTTP Client | Axios | terbaru stabil | Interceptor request/response terpusat untuk inject token & normalisasi error (BR-2, NFR-021). |
| Styling | Tailwind CSS | v3 | Utility-first, konsisten dengan design system, responsif cepat (BR-11, NFR-013, UI-015). |
| Form Validation | Zod | terbaru stabil | Schema validation type-safe, infer tipe TS dari schema, single source of truth validasi (VAL-001–008). |
| Global State | Zustand | terbaru stabil | Boilerplate minimal, akses store di luar React tree (interceptor Axios), re-render selektif. |
| Testing | Vitest + React Testing Library | terbaru stabil | Integrasi native dengan Vite, pengujian berbasis perilaku pengguna (NFR-016). |
| Linting | ESLint | terbaru stabil | Penjaminan kualitas & konsistensi kode (NFR-016). |

> **Catatan versi:** PRD §8.1 menyebut React 19 pada level produk; SDD Frontend ini mengikat versi pada **React 18** sesuai tech stack yang ditetapkan untuk implementasi frontend. Pola desain (function component, hooks, `Suspense`) kompatibel lintas kedua versi sehingga migrasi minor tidak mengubah arsitektur.

> **Library chart:** Untuk `TopPredictionsChart` (FR-016) digunakan satu library chart ringan (mis. Recharts) sebagaimana disebut PRD §8.1. Library chart bersifat detail implementasi komponen `analysis/` dan tidak mengubah kontrak data.

### 1.5 Coding Convention

Konvensi berikut wajib dipatuhi seluruh anggota tim dan ditegakkan melalui ESLint serta review.

**Penamaan:**

| Artefak | Konvensi | Contoh |
|---|---|---|
| Komponen & Page | PascalCase | `UploadPage.tsx`, `Button.tsx`, `TopPredictionsChart.tsx` |
| Custom Hook | camelCase berprefiks `use` | `useAnalysis.ts`, `useCVUpload.ts` |
| Service function | camelCase, verba aksi | `triggerAnalysis()`, `getDashboardData()`, `uploadCV()` |
| Interface / Type | PascalCase | `Analysis`, `LoginPayload`, `ApiResponse<T>` |
| Store | camelCase berakhiran `.store.ts` | `auth.store.ts`, `ui.store.ts` |
| Util / Service file | camelCase / dot-case | `format.ts`, `api.client.ts`, `auth.service.ts` |
| Konstanta global | UPPER_SNAKE_CASE | `API_BASE_URL`, `AI_TIMEOUT_MS` |
| Variabel & fungsi lokal | camelCase | `isLoading`, `handleSubmit()` |

**Konvensi penamaan file:**

- **PascalCase** untuk file komponen dan page (`LoginPage.tsx`, `Sidebar.tsx`).
- **camelCase / dot-case** untuk hook (`useAuth.ts`), service (`cv.service.ts`), util (`error.ts`), store (`auth.store.ts`), dan types (`analysis.ts`).
- File test mengikuti nama subjeknya dengan sufiks `.test.tsx` (`DashboardPage.test.tsx`).

**Path alias:**

- Seluruh import **wajib** menggunakan alias `@/` yang dipetakan ke `src/`. Relative path panjang (`../../../`) dilarang.
- Contoh: `import { Button } from '@/components/ui/Button';` — **bukan** `import { Button } from '../../components/ui/Button';`

**`interface` vs `type` di TypeScript:**

| Gunakan `interface` ketika | Gunakan `type` ketika |
|---|---|
| Mendeskripsikan bentuk objek/entitas domain yang mungkin di-`extends` (mis. `User`, `Analysis`, props komponen). | Mendefinisikan union, intersection, tuple, atau alias generik (mis. `type SourceType = 'text' \| 'file'`). |
| Kontrak props komponen (`interface ButtonProps`). | Tipe utilitas/transformasi (`type Nullable<T> = T \| null`). |
| Diharapkan dapat diperluas (declaration merging) di masa depan. | Tipe yang final dan tidak diperluas. |

**Konvensi tambahan:**

- Komponen ditulis sebagai **function component** dengan tipe props eksplisit melalui `interface`.
- Hook mengembalikan objek bernama (named return) agar pemanggil dapat melakukan destructuring yang jelas.
- Tidak menggunakan `any`; gunakan `unknown` lalu *narrowing*, atau tipe spesifik.
- Tidak ada pemanggilan `axios` langsung di pages/components — hanya melalui service via hook.

---

## 2. Arsitektur Frontend

Frontend Path`Ora menerapkan **layered, component-based architecture** dengan pemisahan tanggung jawab (separation of concerns) yang tegas antar lapisan. Tujuannya adalah memaksimalkan keterujian, keterbacaan, dan skalabilitas jangka panjang (NFR-011, NFR-016).

### 2.1 Prinsip Arsitektur

1. **Component-based architecture** — UI disusun dari komponen kecil yang dapat dikomposisi: primitif (`components/ui/`), layout (`components/layout/`), dan domain-specific (`components/[feature]/`).
2. **Feature-based page organization** — Setiap halaman utama memiliki folder sendiri di `pages/` yang mengelompokkan page component dan test-nya.
3. **Service-based API communication** — Seluruh komunikasi HTTP diisolasi pada lapisan `services/` di atas satu instance Axios terpusat (`api.client.ts`).
4. **Type-safe frontend** — Seluruh data lintas lapisan dideskripsikan tipe TypeScript di `types/`, termasuk pembungkus respons generik `ApiResponse<T>`.
5. **Unidirectional data flow** — Data mengalir satu arah: `Page → Hook → Service → Axios → Backend`, lalu hasilnya kembali memperbarui state dan memicu re-render.

### 2.2 Tanggung Jawab Lapisan (Separation of Concerns)

```
┌──────────────────────────────────────────────────────────────┐
│  PAGES (pages/)                                                │
│  - Orkestrasi tampilan satu halaman, komposisi komponen.       │
│  - Memanggil HOOK untuk data & aksi. TIDAK memanggil Axios.    │
├──────────────────────────────────────────────────────────────┤
│  COMPONENTS (components/)                                       │
│  - Rendering UI murni berdasarkan props.                       │
│  - Emit event/callback ke parent. TIDAK fetch data sendiri.    │
├──────────────────────────────────────────────────────────────┤
│  HOOKS (hooks/)                                                 │
│  - Logika state & efek (loading/error/data), orkestrasi aksi.  │
│  - Memanggil SERVICE. TIDAK merender UI.                       │
├──────────────────────────────────────────────────────────────┤
│  SERVICES (services/)                                           │
│  - Pembungkus endpoint REST (method, path, payload, response). │
│  - Memanggil api.client (Axios). TIDAK menyimpan state.        │
├──────────────────────────────────────────────────────────────┤
│  API CLIENT (services/api.client.ts)                            │
│  - Satu instance Axios, interceptor request & response.        │
├──────────────────────────────────────────────────────────────┤
│  STORE (store/) + UTILS (utils/) + TYPES (types/)               │
│  - Store: state global (auth, ui). Utils: fungsi murni.        │
│  - Types: kontrak data lintas lapisan.                         │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Aturan Ketat Antar Lapisan

Aturan berikut bersifat **wajib** dan menjadi titik pemeriksaan dalam code review:

- **Pages tidak memanggil Axios secara langsung.** Pages hanya berinteraksi dengan hooks (dan terkadang store untuk auth/ui). Ini menjaga page tetap deklaratif dan mudah diuji.
- **Hooks tidak merender UI.** Hook hanya mengelola state, efek, dan memanggil service; tidak mengembalikan JSX.
- **Services tidak menyimpan state.** Service adalah fungsi tanpa state (stateless) yang hanya membungkus pemanggilan HTTP dan mengembalikan data bertipe.
- **Components UI primitif tidak mengandung logika domain.** Komponen di `components/ui/` tidak mengetahui konsep "analisis" atau "CV"; mereka general-purpose.
- **Hanya `api.client.ts`** yang membuat instance Axios dan mendaftarkan interceptor; service lain mengimpor instance tersebut.
- **Hanya store dan hook** yang boleh menjadi sumber state aplikatif. Komponen menerima data via props.

Pemisahan ini memastikan perubahan pada satu lapisan (mis. mengganti base URL, menambah header, mengubah library chart) tidak merembet ke lapisan lain — fondasi skalabilitas dan maintainability (NFR-011, NFR-016).

---

## 3. Environment & Build Configuration

### 3.1 Strategi Multi-Environment

Frontend menggunakan mekanisme environment variable Vite dengan dua environment utama:

| File | Penggunaan | Dikomit ke Repo? |
|---|---|---|
| `.env.local` | Pengembangan lokal di mesin developer (override personal). | ❌ Tidak (di-`.gitignore`). |
| `.env.production` | Build production (di-deploy ke Vercel). Nilai diisi via dashboard Vercel/secret. | ❌ Tidak. |
| `.env.example` | Template berisi daftar variabel wajib **tanpa nilai rahasia**. | ✅ Ya (wajib dikomit). |

Vite memuat file `.env` sesuai mode (`development`/`production`). Hanya variabel berprefiks `VITE_` yang di-*expose* ke kode klien.

### 3.2 Variabel Environment Wajib

| Variabel | Tipe | Deskripsi | Contoh |
|---|---|---|---|
| `VITE_API_BASE_URL` | string (URL) | Base URL REST API backend, termasuk prefiks `/api/v1`. Menjadi `baseURL` Axios. Di production **wajib** `https://` (SEC-009). | `https://api.pathora.app/api/v1` |
| `VITE_AI_TIMEOUT_MS` | number (ms) | Ambang timeout sisi klien untuk endpoint analyze, selaras dengan timeout backend (NFR-003). Setelah ambang ini, frontend menampilkan state retry. | `35000` |

### 3.3 Mengapa Prefiks `VITE_`

Vite secara default **hanya** mengekspos variabel berprefiks `VITE_` ke bundle klien melalui `import.meta.env`. Variabel tanpa prefiks ini tidak akan tersedia di kode browser. Mekanisme ini sekaligus menjadi pengaman: variabel rahasia yang tidak boleh bocor ke klien cukup ditulis tanpa prefiks `VITE_`. **Konsekuensi keamanan:** seluruh nilai `VITE_` akan ter-*bundle* dan terlihat publik di build, sehingga **tidak boleh** berisi secret (SEC-010) — lihat §22.

### 3.4 Sentralisasi Akses Environment — `constants/environment.ts`

Seluruh akses ke `import.meta.env` **dipusatkan** di satu file `@/constants/environment.ts` agar mudah divalidasi dan tidak tersebar:

```typescript
// @/constants/environment.ts
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  AI_TIMEOUT_MS: Number(import.meta.env.VITE_AI_TIMEOUT_MS ?? 35000),
} as const;

// Fail-fast: hentikan boot bila konfigurasi wajib tidak ada.
if (!ENV.API_BASE_URL) {
  throw new Error('[ENV] VITE_API_BASE_URL belum dikonfigurasi.');
}
```

Modul lain (mis. `api.client.ts`) mengimpor `ENV` dari sini, bukan membaca `import.meta.env` langsung.

### 3.5 Konfigurasi `vite.config.ts`

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }, // alias @/ → src/
  },
  server: {
    // Proxy opsional untuk dev: hindari masalah CORS saat lokal.
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  build: {
    target: 'es2020', // target browser modern (NFR-019)
  },
});
```

> **Proxy dev server:** Pada pengembangan lokal, proxy `/api` ke backend lokal dapat digunakan untuk menghindari konfigurasi CORS. Pada production, frontend memakai `VITE_API_BASE_URL` absolut sehingga proxy tidak relevan.

### 3.6 Konfigurasi `tsconfig.json` (Path Alias)

Alias di TypeScript **wajib konsisten** dengan alias Vite agar editor dan compiler mengenali `@/`:

```jsonc
// tsconfig.json (ringkas)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

### 3.7 Target Browser & Strategi Build (NFR-019)

- **Target build:** `es2020` — kompatibel dengan browser desktop & mobile modern terkini (Chrome, Firefox, Edge, Safari) sesuai NFR-019.
- **Optimasi:** Vite melakukan tree-shaking, minifikasi, dan code splitting otomatis. Setiap page dimuat via `React.lazy()` untuk menjaga ukuran bundle awal kecil (NFR-001) — lihat §23.
- **Build command:** `vite build` menghasilkan artefak statis untuk deploy ke Vercel; `tsc --noEmit` dijalankan untuk type-check (NFR-016).

### 3.8 Contoh `.env.example`

```dotenv
# .env.example — WAJIB dikomit. Tidak berisi nilai rahasia.

# Base URL REST API backend (sertakan prefiks /api/v1).
# Production WAJIB https:// (SEC-009).
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Timeout sisi klien untuk endpoint analyze (ms), selaras backend (NFR-003).
VITE_AI_TIMEOUT_MS=35000
```

---

## 4. Struktur Folder Frontend

Struktur folder berikut adalah **acuan utama** dan tidak boleh menyimpang. Setiap folder memiliki tanggung jawab tunggal dan aturan isi yang jelas.

### 4.1 Ringkasan Tanggung Jawab Folder

| Folder / File | Tanggung Jawab | Boleh Berisi | Tidak Boleh Berisi | Requirement Terkait |
|---|---|---|---|---|
| `index.html` | Entry HTML, root mount node. | Tag root `#root`, meta. | Logika aplikasi. | — |
| `src/main.tsx` | Bootstrap React, mount `<App/>`, import `globals.css`. | Provider global, router root. | Logika domain. | — |
| `src/App.tsx` | Root component: pasang `RouterProvider`, `Toast` container, error boundary global. | Komposisi top-level. | Fetch data domain. | NFR-014 |
| `src/vite-env.d.ts` | Deklarasi tipe untuk `import.meta.env`. | Ambient types. | Logika. | — |
| `constants/environment.ts` | Sentralisasi env var. | Konstanta env. | State, fetch. | SEC-010, NFR-003 |
| `types/` | Kontrak tipe data lintas lapisan. | `interface`/`type`. | Logika runtime. | DATA-001–005 |
| `services/` | Pembungkus endpoint REST + Axios client. | Fungsi HTTP stateless. | State, JSX. | API-001–015 |
| `hooks/` | Logika state & orkestrasi aksi per fitur. | Custom hooks. | JSX, Axios langsung. | FR-001–023 |
| `store/` | State global (auth, ui). | Zustand store. | Data domain (list CV/analisis). | SEC-002, NFR-014 |
| `routes/` | Definisi route tree & guard. | Router config, guard. | UI halaman. | UI-001, UI-003, FR-004 |
| `pages/` | Page component per halaman + test. | `*.tsx`, `*.test.tsx`. | Komponen reusable lintas halaman. | UI-008–011 |
| `components/ui/` | Primitif UI general-purpose. | Komponen tanpa logika domain. | Pemanggilan service/hook domain. | UI-012–015, NFR-015 |
| `components/layout/` | Kerangka tata letak. | Layout, navigasi. | Logika fetch domain. | UI-002, NFR-013 |
| `components/[feature]/` | Komponen domain-specific. | Komponen terikat fitur. | Komponen lintas-domain umum. | FR per fitur |
| `utils/` | Fungsi murni (format, filter, sort, validasi, error). | Pure functions, Zod schema. | State, fetch, JSX. | VAL-008, FR-016/17/20/21 |
| `styles/globals.css` | Direktif Tailwind + style global. | `@tailwind`, base layer. | Logika. | UI-015 |

### 4.2 Penjelasan Folder Penting

#### `constants/`
Berisi nilai konstan aplikasi. `environment.ts` menjadi satu-satunya titik baca `import.meta.env` (lihat §3.4). Alasan penempatan: memisahkan konfigurasi dari logika sehingga perubahan environment terlokalisasi.

#### `types/`
Mendefinisikan seluruh kontrak data yang dipertukarkan dengan backend dan dipakai antar lapisan (lihat §10). File dipecah per domain (`auth.ts`, `cv.ts`, `analysis.ts`, `category.ts`, `dashboard.ts`, `api.ts`) dengan `index.ts` sebagai *barrel export*. **Aturan:** tidak boleh ada logika runtime di sini.

#### `services/`
Setiap file service memetakan satu domain endpoint REST (SRS §6). Service mengimpor `apiClient` dari `api.client.ts` dan mengembalikan data bertipe. **Aturan:** service tidak menyimpan state dan tidak mengetahui React.

#### `hooks/`
Menjembatani pages dengan services. Hook mengelola `data/isLoading/error` dan menyediakan action + `retry`/`refetch` (lihat §13). **Aturan:** tidak ada JSX; tidak memanggil Axios langsung (harus via service).

#### `store/`
Hanya untuk state yang benar-benar global: autentikasi (`auth.store.ts`) dan UI feedback (`ui.store.ts`). **Aturan:** data domain (daftar CV, analisis) **tidak** disimpan di store — cukup di hook/local state (lihat §14).

#### `routes/`
`index.tsx` menyusun route tree dengan `createBrowserRouter`; `ProtectedRoute.tsx` dan `PublicRoute.tsx` menjadi guard berbasis status autentikasi dari `auth.store` (lihat §6).

#### `pages/`
Satu folder per halaman utama, memuat page component dan file test berdampingan (co-located test). **Aturan:** komponen yang dipakai >1 halaman harus diangkat ke `components/`, bukan disimpan di folder page.

#### `components/`
Dipisah menjadi `ui/` (primitif general-purpose, reusable tanpa perubahan) dan folder per fitur (`auth/`, `dashboard/`, `upload/`, `analysis/`, `career/`, `profile/`) untuk komponen domain-specific. Pemisahan ini mendukung reusability dan skalabilitas (§23).

#### `utils/`
Fungsi murni tanpa efek samping: `format.ts`, `validation.ts` (Zod schema — single source of truth validasi), `filter.ts`, `sort.ts`, `error.ts`. **Aturan:** mudah diuji unit, tanpa dependensi React.

#### `styles/`
`globals.css` memuat direktif `@tailwind base/components/utilities` dan style dasar global.

### 4.3 Aturan Umum Penempatan File

- File yang dipakai oleh >1 fitur → naik ke `components/ui/` atau `utils/`.
- Logika yang melibatkan state/efek → `hooks/`, bukan di dalam komponen.
- Logika murni transformasi data (filter/sort/format) → `utils/`, bukan di dalam komponen (memudahkan unit test, lihat §20).
- Kontrak tipe → `types/`, tidak didefinisikan inline berulang.


---

## 5. Data Flow Design

Seluruh fitur mengikuti pola aliran data satu arah:

```
User action → Page → Hook → Service → Axios (api.client) → API Backend
            → Response → (utils transform) → State update (hook/store) → Re-render
```

Pages tidak pernah memanggil Axios langsung. Transformasi data (filter/sort) dilakukan di `utils/` lalu hasilnya disimpan ke state hook. Berikut alur untuk tiap fitur utama (F1–F7).

### 5.1 Alur Utama — Upload CV hingga Hasil Analisis (F3 + F4 + F5)

Ini adalah alur paling kritikal. Frontend **tidak pernah** memanggil AI; seluruh komunikasi AI melalui backend (BTS-04, SEC-011).

```
1.  [UploadPage] Pengguna memilih metode (UploadMethodTabs): "Teks" atau "Berkas".
        • Mode teks  → CVTextInput   (VAL-003)
        • Mode berkas → CVFileDropzone (VAL-004: validasi MIME PDF/DOCX & ukuran di klien)

2.  Pengguna menekan tombol "Analisis".
        → UploadPage memanggil useCVUpload.submit(payload)

3.  [useCVUpload] set isUploading=true; tombol dinonaktifkan (FR-010, UI-012).
        → cv.service.uploadCV(payload)
        → POST /cvs  (API-006)  → response: { data: { cv_id, ... } }  (201)

4.  Setelah cv_id diterima, useCVUpload langsung memicu analisis:
        → analysis.service.triggerAnalysis(cvId)
        → POST /cvs/:cvId/analyze (API-010)
        → Axios timeout = VITE_AI_TIMEOUT_MS (NFR-003)

5.  Backend berkomunikasi dengan layanan AI dan menyimpan hasil, lalu membalas:

    5a. SUKSES (200, status "success"):
          → response berisi analysisId (atau cv analysis terbaru)
          → useCVUpload set isUploading=false
          → navigate(`/analysis/:analysisId`)  (FR-011)

    5b. TIMEOUT (504) atau Axios ECONNABORTED (melebihi VITE_AI_TIMEOUT_MS):
          → parseApiError() menghasilkan pesan timeout
          → UploadPage menampilkan ErrorState/AnalysisStatusBanner
            "Analisis memakan waktu terlalu lama" + tombol "Coba lagi"
          → retry memanggil ulang triggerAnalysis(cvId)  (FR-013, NFR-003)
          → TIDAK crash (NFR-009)

    5c. AI ERROR (502):
          → pesan fallback "Layanan analisis sedang tidak tersedia"
          → tombol "Coba lagi" memanggil ulang triggerAnalysis(cvId) (FR-013)

    5d. RESPONS TIDAK VALID (422, status "failed"):
          → pesan "Analisis gagal diproses" + tombol coba lagi
          → analisis ditandai gagal oleh backend (VAL-007)

6.  [AnalysisPage] Setelah redirect, useAnalysis(analysisId) dipanggil:
        → analysis.service.getAnalysisById(analysisId) → GET /analyses/:analysisId (API-013)
        → response payload sesuai API Contract
        → utils/filter.filterByConfidence(top_5_predictions, 0.05)   (FR-016)
        → utils/sort.sortMatchedSkillsBySimilarity(matched_skills)   (FR-017)
        → State update → render TopPredictionsChart, MatchedSkillList,
          MissingSkillList, CareerDescriptionCard.
```

> **Keputusan desain "menunggu hasil":** Pemicuan analisis menggunakan **await langsung** atas `POST /cvs/:cvId/analyze` (synchronous request/response sesuai API-010 yang mengembalikan hasil 200). Polling tidak digunakan pada MVP karena backend membalas hasil pada response yang sama. Status `pending` ditangani sebagai keadaan "request sedang berjalan" (loading), bukan melalui endpoint polling terpisah. Lihat §19 untuk detail penanganan tiap status.

### 5.2 F1 — Login (ringkas)

```
[LoginPage] isi form → validasi Zod (loginSchema, VAL-002)
  → useAuth.login(payload) → auth.service.login() → POST /auth/login (API-002)
  → 200 { data: { token, user } } → auth.store.setToken(token,user)
  → navigate("/dashboard")  (FR-002, UC-002)
  → 401 → ErrorState/inline "Email atau password salah" (tanpa membocorkan detail)
```

### 5.3 F2 — Dashboard Load (ringkas)

```
[DashboardPage] mount → useDashboard()
  → dashboard.service.getDashboardData() → GET /dashboard/me (API-005)
  → 200 → set summary (predicted_category, confidence) + history[]
  → render AnalysisSummaryCard + UploadHistoryList  (FR-005, FR-007, UI-008)
  → data kosong → EmptyState + UploadCTABanner  (FR-005 empty, UI-013)
```

### 5.4 F6 — Career Recommendations (ringkas)

```
[CareerRecommendationsPage] mount → useCareerRecs(analysisId)
  → analysis.service.getAnalysisById(analysisId) → GET /analyses/:analysisId (API-013)
  → utils/filter.filterByMatchScore(career_recommendations, 0.3)  (FR-020, VAL-008)
  → per kategori: sortMatchedSkillsBySimilarity (FR-021)
  → render daftar CategoryCard expandable
  → semua terfilter habis → EmptyState (UI-013)
```

### 5.5 F7 — Edit Profile (ringkas)

```
[ProfilePage] mount → useProfile()
  → user.service.getProfile() → GET /users/me (API-003) → render ProfileBioForm + AnalysisHistoryList
Submit edit:
  → validasi Zod (profileSchema, VAL-005)
  → user.service.updateProfile(payload) → PATCH /users/me (API-004)
  → 200 → ui.store.addToast("Biodata tersimpan") (success state, UI-007)
  → 409 → inline error "Email sudah digunakan"  (FR-022, VAL-005)
```

---

## 6. Routing Design

Routing menggunakan **React Router v6** dengan `createBrowserRouter`. Seluruh rute didefinisikan di `@/routes/index.tsx`. Rute privat dibungkus `ProtectedRoute` dan memakai `AppLayout`; rute publik (auth) dibungkus `PublicRoute` dan memakai layout auth tersendiri.

### 6.1 Tabel Route

| Path | Page Component | Access | Layout | Deskripsi | Requirement |
|---|---|---|---|---|---|
| `/login` | `LoginPage` | Public (redirect bila sudah login) | AuthLayout | Form login + tautan ke register | FR-002, UI-005, UC-002 |
| `/register` | `RegisterPage` | Public (redirect bila sudah login) | AuthLayout | Form registrasi akun baru | FR-001, UI-004, UC-001 |
| `/dashboard` | `DashboardPage` | Protected | AppLayout | Ringkasan analisis terakhir, CTA upload, riwayat | FR-005–007, UI-008, UC-004 |
| `/upload` | `UploadPage` | Protected | AppLayout | Upload CV teks/berkas + trigger analisis | FR-008–011, UI-006, UC-005 |
| `/analysis/:analysisId` | `AnalysisPage` | Protected | AppLayout | Top 5 predictions, skill gap, deskripsi karir | FR-016–019, UI-009, UC-006 |
| `/career-recommendations/:analysisId` | `CareerRecommendationsPage` | Protected | AppLayout | Seluruh kategori + skill gap per kategori | FR-020–021, UI-010, UC-007 |
| `/profile` | `ProfilePage` | Protected | AppLayout | Biodata (lihat/edit) + riwayat analisis | FR-022–023, UI-011, UC-008 |
| `*` | `NotFoundPage` | Public | (minimal) | Halaman 404 untuk path tak dikenal | UI-001 |

> **Redirect default:** `/` diarahkan ke `/dashboard` (akan ter-guard oleh `ProtectedRoute` ke `/login` bila belum autentikasi).

### 6.2 `ProtectedRoute` (Teknis)

`ProtectedRoute` membaca `isAuthenticated` dari `auth.store`. Bila `false`, melakukan redirect ke `/login` sambil menyimpan lokasi asal pada `state.from` untuk *redirect-back* setelah login (FR-004, UI-003, SEC-002).

```typescript
// @/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
```

### 6.3 `PublicRoute` (Teknis)

`PublicRoute` mencegah pengguna yang sudah login mengakses halaman auth. Bila `isAuthenticated` `true`, redirect ke `/dashboard`.

```typescript
// @/routes/PublicRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
```

### 6.4 Penyusunan Route Tree — `routes/index.tsx`

`createBrowserRouter` menyusun pohon rute. Page dimuat lazy dengan `React.lazy` + `Suspense` (NFR-001, §23).

```typescript
// @/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicRoute } from '@/routes/PublicRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Spinner } from '@/components/ui/Spinner';

const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/Auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'));
const UploadPage = lazy(() => import('@/pages/Upload/UploadPage'));
const AnalysisPage = lazy(() => import('@/pages/Analysis/AnalysisPage'));
const CareerRecommendationsPage = lazy(
  () => import('@/pages/CareerRecommendations/CareerRecommendationsPage'),
);
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

const withSuspense = (el: React.ReactNode) => (
  <Suspense fallback={<Spinner fullScreen />}>{el}</Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: <PublicRoute />, // hanya untuk guest
    children: [
      { element: <AuthLayout />, children: [
        { path: '/login', element: withSuspense(<LoginPage />) },
        { path: '/register', element: withSuspense(<RegisterPage />) },
      ]},
    ],
  },
  {
    element: <ProtectedRoute />, // hanya untuk user terautentikasi
    children: [
      { element: <AppLayout />, children: [
        { path: '/dashboard', element: withSuspense(<DashboardPage />) },
        { path: '/upload', element: withSuspense(<UploadPage />) },
        { path: '/analysis/:analysisId', element: withSuspense(<AnalysisPage />) },
        { path: '/career-recommendations/:analysisId', element: withSuspense(<CareerRecommendationsPage />) },
        { path: '/profile', element: withSuspense(<ProfilePage />) },
      ]},
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);
```

`App.tsx` cukup memasang `<RouterProvider router={router} />` beserta container `Toast` global.

---

## 7. Page Design

Setiap halaman dijelaskan dengan: tujuan, data tampil, komponen, endpoint (via service+hook), state (lokal/global), validasi, serta loading/error/empty state, dan requirement terkait.

### 7.1 `RegisterPage` — `/register`

- **Tujuan:** Pendaftaran akun baru (FR-001, UC-001).
- **Data ditampilkan:** Form kosong (nama, email, password, konfirmasi).
- **Komponen:** `AuthLayout`, `RegisterForm`, `Input`, `Button`, `ErrorState`(inline).
- **Endpoint:** `auth.service.register()` → `POST /auth/register` (API-001) via `useAuth`.
- **State:** Lokal form state (nilai field, error per field). Global: tidak ada (belum login).
- **Validasi:** `registerSchema` (Zod, VAL-001) — `full_name` wajib+min, `email` valid, `password` min, `confirmPassword` cocok.
- **Loading:** Tombol submit menampilkan `Spinner` & disabled saat proses (UI-004).
- **Error:** 409/422 email terdaftar → pesan inline pada field email; error lain → `Toast`/banner.
- **Empty:** Tidak relevan.
- **Sukses:** Redirect ke `/login` dengan `Toast` "Registrasi berhasil, silakan login" (UC-001).
- **Requirement:** FR-001, UI-004, VAL-001, API-001.

### 7.2 `LoginPage` — `/login`

- **Tujuan:** Autentikasi pengguna (FR-002, UC-002).
- **Data ditampilkan:** Form login + tautan ke register.
- **Komponen:** `AuthLayout`, `LoginForm`, `Input`, `Button`.
- **Endpoint:** `auth.service.login()` → `POST /auth/login` (API-002) via `useAuth`.
- **State:** Lokal form state. Global: `auth.store` (set token & user setelah sukses).
- **Validasi:** `loginSchema` (Zod, VAL-002) — `email` valid+wajib, `password` wajib.
- **Loading:** Tombol disabled + `Spinner` selama autentikasi.
- **Error:** 401 → pesan netral "Email atau password salah" (tidak membocorkan field mana).
- **Empty:** Tidak relevan.
- **Sukses:** `setToken` → redirect ke `state.from` bila ada, jika tidak ke `/dashboard`.
- **Requirement:** FR-002, FR-004, UI-005, VAL-002, API-002, SEC-002.

### 7.3 `DashboardPage` — `/dashboard`

- **Tujuan:** Ringkasan status kesiapan & jalur aksi (FR-005–007, UC-004).
- **Data ditampilkan:** Card ringkasan analisis terakhir (`predicted_category`, `confidence`), CTA Upload, daftar riwayat upload.
- **Komponen:** `PageHeader`, `AnalysisSummaryCard`, `UploadCTABanner`, `UploadHistoryList` → `UploadHistoryItem`, `Skeleton`, `EmptyState`, `ErrorState`.
- **Endpoint:** `dashboard.service.getDashboardData()` → `GET /dashboard/me` (API-005) via `useDashboard`.
- **State:** Lokal via hook (`summary`, `history`, `isLoading`, `error`). Global: hanya auth (untuk identitas).
- **Validasi:** Tidak ada form.
- **Loading:** `Skeleton` untuk card & list (UI-012).
- **Error:** `ErrorState` + tombol retry (`refetch`).
- **Empty:** Belum ada analisis → `EmptyState` "Belum ada analisis" + `UploadCTABanner` (FR-005 empty, UI-013).
- **Requirement:** FR-005, FR-006, FR-007, UI-008, API-005.

### 7.4 `UploadPage` — `/upload`

- **Tujuan:** Unggah CV (teks/berkas) & memicu analisis (FR-008–011, UC-005).
- **Data ditampilkan:** Tab metode, area teks atau dropzone berkas, tombol Analisis, progress.
- **Komponen:** `PageHeader`, `UploadMethodTabs`, `CVTextInput`, `CVFileDropzone`, `FileValidationError`, `ProgressBar`, `Button`, `AnalysisStatusBanner`/`ErrorState`.
- **Endpoint:** `cv.service.uploadCV()` → `POST /cvs` (API-006), lalu `analysis.service.triggerAnalysis()` → `POST /cvs/:cvId/analyze` (API-010) via `useCVUpload`.
- **State:** Lokal: metode aktif, nilai teks/berkas, `isUploading`, `progress`, `error`. Global: tidak ada.
- **Validasi:** `cvTextSchema` (VAL-003) untuk teks; validasi MIME & ukuran berkas (VAL-004) sebelum kirim.
- **Loading:** `ProgressBar` saat upload berkas (FR-010); `Spinner` & tombol disabled saat analisis (mencegah submit ganda).
- **Error:** Tipe/ukuran invalid → `FileValidationError` + saran fallback teks; AI timeout 504 / error 502 / failed 422 → `AnalysisStatusBanner` + retry (FR-013, §19).
- **Empty:** Tidak relevan.
- **Sukses:** Redirect ke `/analysis/:analysisId` (FR-011).
- **Requirement:** FR-008–011, FR-013, UI-006, UI-012, VAL-003, VAL-004, API-006, API-010.

### 7.5 `AnalysisPage` — `/analysis/:analysisId`

- **Tujuan:** Menyajikan hasil analisis satu CV (FR-016–019, UC-006).
- **Data ditampilkan:** Bar chart Top 5 predictions (filter `confidence > 0.05`), skill gap (matched terurut desc + missing), deskripsi karir, tautan ke rekomendasi karir.
- **Komponen:** `PageHeader`, `TopPredictionsChart`, `SkillGapSection` → `MatchedSkillList`/`MissingSkillList`, `CareerDescriptionCard`, `AnalysisStatusBanner`, `Skeleton`, `EmptyState`, `ErrorState`, `Button`(link).
- **Endpoint:** `analysis.service.getAnalysisById(analysisId)` → `GET /analyses/:analysisId` (API-013) via `useAnalysis`.
- **State:** Lokal via hook (`analysis`, `isLoading`, `error`); data terfilter/tersortir dihitung dari payload.
- **Validasi:** `analysisId` divalidasi format param (VAL-006); tidak ada form.
- **Loading:** `Skeleton` untuk chart & section skill (UI-012).
- **Error:** 404 → `ErrorState` "Analisis tidak ditemukan"; 401 → ditangani interceptor; status `failed` → `AnalysisStatusBanner` + retry (FR-013).
- **Empty:** Seluruh item terfilter habis → `EmptyState` per section (FR-016/017 empty, UI-013).
- **Requirement:** FR-016, FR-017, FR-018, FR-019, UI-009, VAL-008, API-013.

### 7.6 `CareerRecommendationsPage` — `/career-recommendations/:analysisId`

- **Tujuan:** Menyajikan seluruh kategori rekomendasi + skill gap per kategori (FR-020–021, UC-007).
- **Data ditampilkan:** Daftar `CategoryCard` expandable (filter `match_score > 0.3`), tiap kartu memuat `CategorySkillGap`.
- **Komponen:** `PageHeader`, `CareerRecsFilter`, `CategoryCard` → `CategorySkillGap`, `Skeleton`, `EmptyState`, `ErrorState`.
- **Endpoint:** `analysis.service.getAnalysisById(analysisId)` → `GET /analyses/:analysisId` (API-013) via `useCareerRecs`.
- **State:** Lokal via hook (`recommendations` terfilter, `isLoading`, `error`); state expand/collapse per kartu lokal di `CategoryCard`.
- **Validasi:** `analysisId` format param (VAL-006).
- **Loading:** `Skeleton` daftar kartu.
- **Error:** `ErrorState` + retry.
- **Empty:** Semua terfilter habis → `EmptyState` (FR-020 empty, UI-013).
- **Requirement:** FR-020, FR-021, UI-010, VAL-008, API-013.

### 7.7 `ProfilePage` — `/profile`

- **Tujuan:** Lihat/edit biodata & riwayat analisis (FR-022–023, UC-008).
- **Data ditampilkan:** Form biodata (nama, email), daftar riwayat analisis.
- **Komponen:** `PageHeader`, `ProfileBioForm`, `AnalysisHistoryList` → `AnalysisHistoryItem`, `Input`, `Button`, `Skeleton`, `EmptyState`, `ErrorState`.
- **Endpoint:** `user.service.getProfile()` → `GET /users/me` (API-003); `user.service.updateProfile()` → `PATCH /users/me` (API-004); riwayat `analysis.service.listAnalyses()` → `GET /analyses` (API-012) via `useProfile`.
- **State:** Lokal: form state biodata, status submit. Global: `auth.store.user` disinkronkan setelah update.
- **Validasi:** `profileSchema` (Zod, VAL-005) — email valid & wajib bila diubah.
- **Loading:** `Skeleton` saat fetch; `Spinner` saat submit.
- **Error:** 409 email duplikat → inline error; error lain → `Toast`.
- **Empty:** Riwayat kosong → `EmptyState`.
- **Sukses:** `Toast` "Biodata diperbarui".
- **Requirement:** FR-022, FR-023, UI-007, UI-011, VAL-005, API-003, API-004, API-012.

### 7.8 `NotFoundPage` — `*`

- **Tujuan:** Menangani path tak dikenal.
- **Data ditampilkan:** Pesan 404 + tautan kembali ke `/dashboard`.
- **Komponen:** `EmptyState`/markup minimal, `Button`(link).
- **Endpoint:** Tidak ada.
- **State:** Tidak ada.
- **Requirement:** UI-001.

---

## 8. Component Design

Komponen dipisah menjadi **general-purpose** (`components/ui/`) dan **domain-specific** (per fitur). Props dideskripsikan dengan `interface`. Konvensi: komponen menerima data via props dan meng-emit aksi via callback (`on*`), tanpa fetch sendiri.

### 8.1 `components/ui/` — Primitive Components

Komponen ini general-purpose, tidak mengenal domain, dan dapat dipakai ulang tanpa perubahan (mendukung reusability, §23). Aksesibilitas dasar (semantic HTML, `aria-*`) menjadi tanggung jawab lapisan ini (NFR-015).

| Komponen | Tanggung Jawab | Props Utama | Emit | Requirement |
|---|---|---|---|---|
| `Button` | Tombol aksi konsisten | `variant: 'primary'\|'secondary'\|'ghost'\|'danger'`, `isLoading?: boolean`, `disabled?`, `type?`, `onClick?`, `children` | `onClick` | NFR-015 |
| `Input` | Field teks + label + error | `label?`, `name`, `value`, `error?: string`, `type?`, `onChange` | `onChange`, `onBlur` | UI-004–007 |
| `Textarea` | Input multiline (teks CV) | `label?`, `value`, `error?`, `rows?`, `maxLength?`, `onChange` | `onChange`, `onBlur` | UI-006, VAL-003 |
| `Card` | Kontainer konten | `title?`, `footer?`, `className?`, `children` | — | UI-015 |
| `Badge` | Label status/kategori | `variant`, `children` | — | UI-009 |
| `Spinner` | Indikator loading aksi | `size?`, `fullScreen?: boolean` | — | UI-012 |
| `Skeleton` | Placeholder konten berstruktur | `variant: 'text'\|'card'\|'list'`, `count?` | — | UI-012 |
| `EmptyState` | Tampilan data kosong | `title`, `description?`, `action?: ReactNode` (CTA) | — | UI-013 |
| `ErrorState` | Tampilan error + retry | `message`, `onRetry?: () => void` | `onRetry` | UI-014 |
| `Modal` | Dialog overlay | `isOpen`, `title?`, `onClose`, `children` | `onClose` | — |
| `Toast` | Notifikasi sukses/error sementara | `type: 'success'\|'error'\|'info'`, `message`, `duration?` | auto-dismiss | UI-013, NFR-014 |
| `ProgressBar` | Progress upload berkas | `value: number` (0–100), `label?` | — | FR-010 |

Contoh kontrak props:

```typescript
// @/components/ui/Button.tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

// @/components/ui/ErrorState.tsx
export interface ErrorStateProps {
  message: string;
  onRetry?: () => void; // bila ada, render tombol "Coba lagi"
}
```

### 8.2 `components/layout/`

| Komponen | Tanggung Jawab | Props Utama | Requirement |
|---|---|---|---|
| `AppLayout` | Kerangka halaman privat: Sidebar + Navbar + `<Outlet/>` area konten | — (mengambil dari router) | UI-002, NFR-013 |
| `Sidebar` | Navigasi global desktop: link Dashboard, Upload, Profile, tombol Logout | `onLogout?` | UI-002 |
| `Navbar` | Topbar mobile: nama halaman + hamburger pembuka sidebar | `title`, `onToggleMenu` | UI-002, NFR-013 |
| `PageHeader` | Judul halaman + breadcrumb opsional + slot aksi | `title`, `breadcrumb?`, `actions?: ReactNode` | UI-015 |

> Catatan: `AuthLayout` (untuk halaman publik) dibahas pada §9; berada di `components/layout/` sebagai layout terpisah tanpa Sidebar/Navbar.

### 8.3 `components/auth/`

| Komponen | Tanggung Jawab | Props Utama | Emit | Requirement |
|---|---|---|---|---|
| `RegisterForm` | Form registrasi + validasi Zod inline | `onSubmit: (data: RegisterPayload) => void`, `isSubmitting`, `serverError?` | `onSubmit` | FR-001, UI-004, VAL-001 |
| `LoginForm` | Form login + validasi Zod inline | `onSubmit: (data: LoginPayload) => void`, `isSubmitting`, `serverError?` | `onSubmit` | FR-002, UI-005, VAL-002 |

Form bersifat *presentational + validation*: menerima callback `onSubmit`, sementara orkestrasi service dilakukan page via `useAuth`.

### 8.4 `components/dashboard/`

| Komponen | Tanggung Jawab | Props Utama | Emit | Requirement |
|---|---|---|---|---|
| `AnalysisSummaryCard` | Tampilkan kategori prediksi teratas + confidence | `category: string`, `confidence: number` | — | FR-005, UI-008 |
| `UploadCTABanner` | CTA menuju `/upload` | `onClick?` / `to` | navigasi | FR-006 |
| `UploadHistoryList` | Daftar riwayat upload | `items: HistoryItem[]`, `onSelect(id)` | `onSelect` | FR-007, UI-008 |
| `UploadHistoryItem` | Satu baris riwayat (tanggal, kategori, confidence, aksi) | `item: HistoryItem`, `onView(id)` | `onView` | FR-007 |

### 8.5 `components/upload/`

| Komponen | Tanggung Jawab | Props Utama | Emit | Requirement |
|---|---|---|---|---|
| `UploadMethodTabs` | Pemilih metode teks/berkas | `active: SourceType`, `onChange(method)` | `onChange` | UI-006 |
| `CVTextInput` | Area tempel teks CV + counter min | `value`, `error?`, `onChange` | `onChange` | FR-008, VAL-003 |
| `CVFileDropzone` | Drag-drop berkas + validasi klien (MIME/ukuran) | `onFileSelected(file)`, `accept`, `maxSizeMB` | `onFileSelected`, `onValidationError` | FR-009, VAL-004 |
| `FileValidationError` | Pesan error berkas + saran fallback teks | `message` | — | VAL-004, UI-014 |

### 8.6 `components/analysis/`

| Komponen | Tanggung Jawab | Props Utama | Emit | Requirement |
|---|---|---|---|---|
| `TopPredictionsChart` | Bar chart Top 5 predictions (sudah terfilter) | `predictions: TopPrediction[]` | — | FR-016, UI-009 |
| `SkillGapSection` | Wadah skill gap (matched + missing) | `matched: ExtractedSkill[]`, `missing: string[]` | — | FR-017 |
| `MatchedSkillList` | Daftar skill dimiliki + similarity (terurut desc) | `skills: MatchedSkill[]` | — | FR-017, VAL-008 |
| `MissingSkillList` | Daftar skill yang perlu ditambah | `skills: string[]` | — | FR-017 |
| `CareerDescriptionCard` | Render teks deskripsi karir; placeholder bila kosong | `description: string \| null` | — | FR-018 |
| `AnalysisStatusBanner` | Banner status analisis (pending/failed/timeout/error) + retry | `status`, `onRetry?` | `onRetry` | FR-013, UI-014 |

### 8.7 `components/career/`

| Komponen | Tanggung Jawab | Props Utama | Emit | Requirement |
|---|---|---|---|---|
| `CategoryCard` | Kartu kategori expandable (match_score) | `recommendation: CareerRecommendation`, `expanded`, `onToggle()` | `onToggle` | FR-020, FR-021, UI-010 |
| `CategorySkillGap` | Skill gap (matched/missing) per kategori | `matched: MatchedSkill[]`, `missing: string[]` | — | FR-021 |
| `CareerRecsFilter` | Kontrol tampilan/urutan opsional | `value`, `onChange` | `onChange` | FR-020 |

### 8.8 `components/profile/`

| Komponen | Tanggung Jawab | Props Utama | Emit | Requirement |
|---|---|---|---|---|
| `ProfileBioForm` | Form edit biodata + validasi Zod | `initial: User`, `onSubmit(data)`, `isSubmitting`, `serverError?` | `onSubmit` | FR-022, UI-007, VAL-005 |
| `AnalysisHistoryList` | Daftar riwayat analisis | `items: HistoryItem[]`, `onSelect(id)` | `onSelect` | FR-023, UI-011 |
| `AnalysisHistoryItem` | Satu item riwayat → buka AnalysisPage | `item: HistoryItem`, `onOpen(analysisId)` | `onOpen` | FR-023 |

### 8.9 Klasifikasi Reusability

- **General-purpose (reusable lintas fitur):** seluruh `components/ui/` dan `components/layout/`.
- **Domain-specific (terikat fitur):** `auth/`, `dashboard/`, `upload/`, `analysis/`, `career/`, `profile/`. Komponen domain-specific boleh menyusun komponen `ui/` tetapi tidak sebaliknya.

---

## 9. Layout Design

### 9.1 `AppLayout` (Halaman Privat)

`AppLayout` adalah wrapper seluruh halaman privat. Tata letak: `Sidebar` (kiri, desktop) + `Navbar` (atas, mobile) + area konten utama (`<Outlet/>`). Dirender hanya di dalam `ProtectedRoute`.

```
┌────────────────────────────────────────────┐
│ Navbar (mobile saja: title + hamburger)     │
├──────────┬─────────────────────────────────┤
│ Sidebar  │  <main>                          │
│ (desktop)│    <PageHeader/>                 │
│  - Dash  │    <Outlet/>  ← konten halaman   │
│  - Upload│                                  │
│  - Profile│                                 │
│  - Logout│                                  │
└──────────┴─────────────────────────────────┘
```

### 9.2 `Sidebar` (UI-002)

Navigasi global berisi tautan ke **Dashboard**, **Upload**, **Profile**, dan tombol **Logout**. Item aktif ditandai (active state via `NavLink`). Tombol Logout memanggil `useAuth.logout()`. Halaman Analysis & Career Recommendations diakses dari Dashboard/Riwayat (bukan dari sidebar), sesuai UI-002.

### 9.3 `Navbar` (Mobile)

Topbar khusus mobile/tablet sempit: menampilkan nama halaman aktif dan tombol hamburger untuk membuka Sidebar sebagai drawer. Pada desktop, Navbar disembunyikan dan Sidebar permanen (NFR-013).

### 9.4 `PageHeader`

Menampilkan judul halaman, breadcrumb opsional (mis. Dashboard › Analysis), dan slot aksi (mis. tombol "Lihat Rekomendasi Karir" di AnalysisPage). Dipakai konsisten di seluruh halaman privat untuk keseragaman (UI-015).

### 9.5 `AuthLayout` (Halaman Publik)

Halaman `/login` dan `/register` **tidak** memakai `AppLayout`. `AuthLayout` menyediakan tata letak terpusat (centered card) tanpa Sidebar/Navbar: latar bersih, logo Path`Ora, dan kartu form di tengah. Ini menegaskan pemisahan konteks publik vs privat.

```
┌────────────────────────────────────────────┐
│                                            │
│                [ Logo Path`Ora ]           │
│            ┌────────────────────┐          │
│            │   Form (Login/     │          │
│            │   Register Card)   │          │
│            └────────────────────┘          │
│                                            │
└────────────────────────────────────────────┘
```

### 9.6 Perbedaan Layout Public vs Protected

| Aspek | Public (`/login`, `/register`) | Protected (`/dashboard` dst.) |
|---|---|---|
| Layout | `AuthLayout` | `AppLayout` |
| Navigasi | Tidak ada sidebar/navbar | Sidebar + Navbar (UI-002) |
| Guard | `PublicRoute` (redirect bila login) | `ProtectedRoute` (redirect bila belum login) |
| Konten | Form auth terpusat | Konten fitur + `PageHeader` |

### 9.7 Responsivitas Tailwind (NFR-013)

Breakpoint mengikuti SRS: mobile ≤640px, tablet 641–1024px, desktop >1024px. Implementasi memakai utilitas responsif Tailwind:

| Breakpoint | Prefiks Tailwind | Perilaku Layout |
|---|---|---|
| Mobile (≤640px) | default (mobile-first) | Sidebar tersembunyi → drawer via hamburger; konten 1 kolom; chart full-width. |
| Tablet (641–1024px) | `md:` | Sidebar collapsible; grid 2 kolom untuk kartu. |
| Desktop (>1024px) | `lg:` | Sidebar permanen; grid multi-kolom; chart & skill gap berdampingan. |

Contoh pola: `class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"`. Konsistensi spacing, radius, dan palet mengikuti design system Tailwind (UI-015).


---

## 10. Type Design

### 10.1 Prinsip Desain Tipe

- **`interface` vs `type`:** gunakan `interface` untuk entitas domain & props (dapat di-`extends`); gunakan `type` untuk union/alias/utilitas (lihat §1.5).
- **Field nullable dari API:** bedakan dua kasus secara konsisten:
  - Field yang **selalu ada** namun nilainya bisa kosong → `string | null` (mis. `description_career_recommendations: string | null`).
  - Field yang **mungkin tidak dikirim** backend → optional `?` (mis. `file_url?: string`).
  - Hindari mencampur keduanya tanpa alasan; ini memudahkan *narrowing* dan mencegah `undefined` tak terduga.
- **Selaras API Contract tanpa duplikasi:** tipe frontend mencerminkan API Contract PRD §10 / SRS DATA-005. Satu definisi per entitas, di-*re-export* via `types/index.ts` (barrel) sehingga tidak ada duplikasi antar file.
- **Generic `ApiResponse<T>`:** seluruh respons backend mengikuti `{ data, error, meta }` (BTS-08, NFR-021), dibungkus tipe generik agar konsumsi API type-safe & seragam.

### 10.2 Isi & Tujuan File `types/`

| File | Tujuan | Tipe Utama |
|---|---|---|
| `auth.ts` | Kontrak autentikasi | `User`, `LoginPayload`, `RegisterPayload`, `AuthResponse` |
| `cv.ts` | Kontrak CV | `CV`, `CVUploadPayload`, `SourceType` |
| `analysis.ts` | Kontrak hasil analisis | `Analysis`, `AnalysisStatus`, `TopPrediction`, `MatchedSkill`, `ExtractedSkill`, `SkillGapItem`, `CareerRecommendation` |
| `category.ts` | Kontrak kategori referensi | `Category` |
| `dashboard.ts` | Kontrak dashboard | `DashboardSummary`, `HistoryItem` |
| `api.ts` | Pembungkus respons & error | `ApiResponse<T>`, `ApiError`, `Meta` |
| `index.ts` | Barrel export seluruh tipe | re-export `*` |

### 10.3 Contoh Interface Utama

```typescript
// @/types/api.ts
export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
}
export interface ApiError {
  code: string;        // mis. 'VALIDATION_ERROR', 'UNAUTHORIZED'
  message: string;     // pesan siap tampil / dinormalisasi
  fields?: Record<string, string>; // error per field (422)
}
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: Meta | null;
}
```

```typescript
// @/types/auth.ts
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}
export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}
export interface AuthResponse { token: string; user: User; }
```

```typescript
// @/types/cv.ts
export type SourceType = 'text' | 'file';
export interface CV {
  id: string;
  user_id: string;
  source_type: SourceType;
  raw_text: string | null;
  file_url?: string;        // opsional bila sumber teks
  created_at: string;
}
export interface CVUploadPayload {
  source_type: SourceType;
  raw_text?: string;        // wajib bila source_type='text'
  file?: File;              // wajib bila source_type='file'
}
```

```typescript
// @/types/analysis.ts
export type AnalysisStatus = 'pending' | 'success' | 'failed';

export interface TopPrediction { category: string; confidence: number; }
export interface MatchedSkill { skill: string; similarity: number; }

export interface ExtractedSkill {
  category: string;
  matched_skills: MatchedSkill[];
  missing_skills: string[];
}
export interface CareerRecommendation {
  category: string;
  match_score: number;
  // detail skill gap per kategori diturunkan dari extracted_skills kategori yang sama
}
export interface SkillGapItem {       // bentuk gabungan untuk render UI
  category: string;
  matched_skills: MatchedSkill[];
  missing_skills: string[];
}

export interface Analysis {
  id: string;
  cv_id: string;
  status: AnalysisStatus;
  analyzed_at: string | null;
  predicted_category: string;
  confidence: number;
  top_5_predictions: TopPrediction[];
  extracted_skills: ExtractedSkill[];
  career_recommendations: CareerRecommendation[];
  description_career_recommendations: string | null; // bisa kosong → placeholder (FR-018)
}
```

```typescript
// @/types/dashboard.ts
export interface HistoryItem {
  analysis_id: string;
  cv_id: string;
  predicted_category: string;
  confidence: number;
  analyzed_at: string;
}
export interface DashboardSummary {
  last_analysis: {
    analysis_id: string;
    predicted_category: string;
    confidence: number;
  } | null;                       // null → empty state (FR-005)
  history: HistoryItem[];
}

// @/types/category.ts
export interface Category {
  code: string;          // 'INFORMATION-TECHNOLOGY'
  display_name: string;
  description: string;
}
```

---

## 11. API Integration Design

Seluruh komunikasi HTTP melewati **satu instance Axios** di `@/services/api.client.ts`. Sentralisasi ini memenuhi BR-2 dan memudahkan perubahan baseURL/header/interceptor tanpa menyentuh banyak file (§23).

### 11.1 Konfigurasi Dasar

- `baseURL` diambil dari `ENV.API_BASE_URL` (`VITE_API_BASE_URL`), sudah termasuk `/api/v1`.
- `timeout` default untuk request umum; endpoint analyze memakai `ENV.AI_TIMEOUT_MS` per-request (NFR-003).
- `headers` default `Content-Type: application/json` (untuk upload berkas, biarkan Axios set `multipart/form-data` otomatis via `FormData`).

### 11.2 Request Interceptor

Menyisipkan JWT dari `auth.store` ke header `Authorization: Bearer <token>` pada setiap request. Token dibaca via `useAuthStore.getState()` — **akses store di luar React tree** (alasan utama memilih Zustand, §14).

### 11.3 Response Interceptor (Error Handling Terpusat)

Menangani error secara terpusat berdasarkan status (NFR-021, SEC-002):

| Kondisi | Aksi Interceptor |
|---|---|
| 401 Unauthorized | `auth.store.clearAuth()` → redirect `/login`; reject error ternormalisasi |
| 403 Forbidden | reject error "Akses ditolak" (UI ber-`ErrorState`) |
| 5xx Server | reject error "Terjadi kesalahan server" (UI retry) |
| Network error (tanpa `response`) | reject error "Koneksi gagal" (UI retry) |
| Lainnya (422/404/502/504) | diteruskan ke hook untuk penanganan kontekstual |

> **Format respons:** Interceptor mengasumsikan body `{ data, error, meta }` (BTS-08). Untuk sukses, mengembalikan `response.data`; untuk error, mengubah menjadi bentuk yang dapat di-`parseApiError()` (§20).

### 11.4 Penanganan 401 & Network Error

- **401:** hapus token (`clearAuth`) lalu redirect `/login`. Karena redirect dilakukan di luar komponen, interceptor memakai utilitas navigasi (mis. `window.location.assign('/login')` atau navigator yang di-inject) — keputusan: gunakan event/`window.location` agar tidak bergantung pada hook router di dalam interceptor.
- **Network error:** lempar error user-friendly ("Koneksi gagal, periksa jaringan Anda") yang dapat ditangkap hook dan dirender via `ErrorState` + retry.

### 11.5 Retry Strategy

- **Endpoint AI (`/cvs/:cvId/analyze`):** **tidak** ada retry otomatis di level Axios. Retry dikendalikan pengguna melalui tombol "Coba lagi" di UI (FR-013, §19), agar pengguna sadar proses analisis yang berbiaya dan tidak terjadi retry berlipat.
- **Endpoint non-AI:** retry otomatis **tidak digunakan** pada MVP. Alasan: endpoint non-AI cepat (<300ms, NFR-002) dan kegagalannya umumnya deterministik (validasi/otorisasi) sehingga retry otomatis tidak bermanfaat dan berisiko menutupi bug. Bila diperlukan kelak, `axios-retry` dapat ditambahkan terbatas pada GET idempoten dengan backoff — keputusan ini ditangguhkan demi kesederhanaan dan prediktabilitas.

### 11.6 Contoh `api.client.ts`

```typescript
// @/services/api.client.ts
import axios, { AxiosError } from 'axios';
import { ENV } from '@/constants/environment';
import { useAuthStore } from '@/store/auth.store';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000, // default; analyze override per-request dengan ENV.AI_TIMEOUT_MS
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject JWT dari store (akses di luar React tree)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: error handling terpusat
apiClient.interceptors.response.use(
  (response) => response.data, // unwrap { data, error, meta }
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    // 403/404/422/502/504/5xx & network error diteruskan ke hook,
    // dinormalisasi lewat parseApiError() di lapisan hook (§20).
    return Promise.reject(error);
  },
);
```

---

## 12. Services Design

Setiap service membungkus satu domain endpoint REST (SRS §6), mengimpor `apiClient`, dan mengembalikan data bertipe. Service **stateless**.

### 12.1 `auth.service.ts`

| Function | Endpoint | Method | Request | Response | Requirement |
|---|---|---|---|---|---|
| `login(payload)` | `/auth/login` | POST | `LoginPayload` | `AuthResponse` | FR-002, API-002, VAL-002 |
| `register(payload)` | `/auth/register` | POST | `RegisterPayload` | `User` | FR-001, API-001, VAL-001 |

```typescript
// @/services/auth.service.ts
import { apiClient } from '@/services/api.client';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types';

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<unknown, AuthResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) =>
    apiClient.post<unknown, User>('/auth/register', payload),
};
```

### 12.2 `cv.service.ts`

| Function | Endpoint | Method | Request | Response | Requirement |
|---|---|---|---|---|---|
| `uploadCV(payload)` | `/cvs` | POST | `CVUploadPayload` (JSON teks / `FormData` berkas) | `CV` (berisi `cv_id`) | FR-008, FR-009, API-006 |
| `listCVs(params?)` | `/cvs` | GET | `{ limit?, offset? }` | `CV[]` | FR-012, API-007 |
| `getCVById(cvId)` | `/cvs/:cvId` | GET | path `cvId` | `CV` | FR-012, API-008 |
| `deleteCV(cvId)` | `/cvs/:cvId` | DELETE | path `cvId` | `void` | FR-012, API-009 |

### 12.3 `analysis.service.ts`

| Function | Endpoint | Method | Request | Response | Requirement |
|---|---|---|---|---|---|
| `triggerAnalysis(cvId)` | `/cvs/:cvId/analyze` | POST | path `cvId`; `timeout=AI_TIMEOUT_MS` | `Analysis` | FR-011, FR-013, API-010 |
| `getAnalysisById(analysisId)` | `/analyses/:analysisId` | GET | path `analysisId` | `Analysis` | FR-016–021, API-013 |
| `listAnalyses(params?)` | `/analyses` | GET | `{ limit?, offset? }` | `Analysis[]` (ringkas) | FR-023, API-012 |

```typescript
// @/services/analysis.service.ts
import { apiClient } from '@/services/api.client';
import { ENV } from '@/constants/environment';
import type { Analysis } from '@/types';

export const analysisService = {
  triggerAnalysis: (cvId: string) =>
    apiClient.post<unknown, Analysis>(`/cvs/${cvId}/analyze`, null, {
      timeout: ENV.AI_TIMEOUT_MS, // override timeout untuk endpoint AI (NFR-003)
    }),
  getAnalysisById: (analysisId: string) =>
    apiClient.get<unknown, Analysis>(`/analyses/${analysisId}`),
  listAnalyses: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<unknown, Analysis[]>('/analyses', { params }),
};
```

### 12.4 `dashboard.service.ts`

| Function | Endpoint | Method | Request | Response | Requirement |
|---|---|---|---|---|---|
| `getDashboardData()` | `/dashboard/me` | GET | — | `DashboardSummary` | FR-005–007, API-005 |

### 12.5 `user.service.ts`

| Function | Endpoint | Method | Request | Response | Requirement |
|---|---|---|---|---|---|
| `getProfile()` | `/users/me` | GET | — | `User` | FR-022, API-003 |
| `updateProfile(payload)` | `/users/me` | PATCH | `Partial<User>` | `User` | FR-022, API-004, VAL-005 |

### 12.6 `category.service.ts`

| Function | Endpoint | Method | Request | Response | Requirement |
|---|---|---|---|---|---|
| `getCategories()` | `/categories` | GET | — | `Category[]` | FR-024, API-014 |

---

## 13. Hooks Design

Hook menjembatani pages dan services, mengelola `data/isLoading/error`, serta menyediakan action + `retry`/`refetch`. Hook **tidak** merender UI dan **tidak** memanggil Axios langsung. Setiap hook menormalisasi error via `parseApiError()` (§20).

### 13.1 `useAuth`

- **Tujuan:** Orkestrasi login, register, logout, dan ekspos status autentikasi.
- **State:** `isSubmitting: boolean`, `error: string | null`. Status `isAuthenticated`/`currentUser` dibaca dari `auth.store`.
- **Service:** `authService`.
- **Return:** `{ login, register, logout, isAuthenticated, currentUser, isSubmitting, error }`.
- **Loading/Error/Retry:** `isSubmitting` selama proses; `error` dinormalisasi; retry = submit ulang.
- **Requirement:** FR-001, FR-002, FR-003, FR-004.

```typescript
// @/hooks/useAuth.ts (inti)
export function useAuth() {
  const { setToken, clearAuth, user, isAuthenticated } = useAuthStore();
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (payload: LoginPayload) => {
    setSubmitting(true); setError(null);
    try {
      const res = await authService.login(payload);   // AuthResponse
      setToken(res.token, res.user);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(parseApiError(e));                      // §20
    } finally { setSubmitting(false); }
  };

  const logout = () => { clearAuth(); navigate('/login', { replace: true }); };
  // register() serupa: sukses → navigate('/login') + toast
  return { login, logout, currentUser: user, isAuthenticated, isSubmitting, error };
}
```

### 13.2 `useDashboard`

- **Tujuan:** Fetch ringkasan analisis terakhir + riwayat.
- **State:** `summary: DashboardSummary | null = null`, `isLoading = true`, `error: string | null = null`.
- **Service:** `dashboardService.getDashboardData()`.
- **Return:** `{ summary, history, isLoading, error, refetch }`.
- **Loading/Error/Retry:** `Skeleton` saat `isLoading`; `ErrorState` memanggil `refetch`.
- **Requirement:** FR-005, FR-007, API-005.

### 13.3 `useCVUpload`

- **Tujuan:** Kelola state upload, progress, validasi, dan trigger analisis pasca-upload.
- **State:** `isUploading = false`, `progress = 0`, `error: string | null = null`, `lastCvId: string | null`.
- **Service:** `cvService.uploadCV()` lalu `analysisService.triggerAnalysis()`.
- **Return:** `{ submit, isUploading, progress, error, retryAnalysis }`.
- **Loading/Error/Retry:** `ProgressBar` (upload) + `Spinner` (analisis); error timeout/502/422 → pesan + `retryAnalysis(cvId)` (FR-013).
- **Requirement:** FR-008–011, FR-013, VAL-003, VAL-004.

```typescript
// @/hooks/useCVUpload.ts (inti)
export function useCVUpload() {
  const [isUploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastCvId, setLastCvId] = useState<string | null>(null);
  const navigate = useNavigate();

  const runAnalysis = async (cvId: string) => {
    const analysis = await analysisService.triggerAnalysis(cvId); // throws on 504/502/422
    navigate(`/analysis/${analysis.id}`);
  };

  const submit = async (payload: CVUploadPayload) => {
    setUploading(true); setError(null);
    try {
      const cv = await cvService.uploadCV(payload); // onUploadProgress → setProgress
      setLastCvId(cv.id);
      await runAnalysis(cv.id);
    } catch (e) {
      setError(parseApiError(e)); // pesan timeout/AI/validation (§17, §20)
    } finally { setUploading(false); }
  };

  const retryAnalysis = () => lastCvId && runAnalysis(lastCvId);
  return { submit, isUploading, progress, error, retryAnalysis };
}
```

### 13.4 `useAnalysis`

- **Tujuan:** Fetch analisis by ID + transformasi data (filter + sort) untuk tampilan.
- **State:** `analysis: Analysis | null = null`, `isLoading = true`, `error: string | null = null`.
- **Service:** `analysisService.getAnalysisById()`.
- **Return:** `{ analysis, topPredictions, matchedSkills, missingSkills, description, isLoading, error, refetch, retryAnalysis }`.
- **Transformasi:** `filterByConfidence(top_5_predictions, 0.05)` (FR-016) + `sortMatchedSkillsBySimilarity()` (FR-017) via `utils/`.
- **Requirement:** FR-016–018, VAL-008, API-013.

### 13.5 `useCareerRecs`

- **Tujuan:** Fetch rekomendasi karir + filter `match_score > 0.3`.
- **State:** `recommendations: SkillGapItem[] = []`, `isLoading`, `error`.
- **Service:** `analysisService.getAnalysisById()` (payload sama dengan analysis, ditampilkan beda).
- **Return:** `{ recommendations, isLoading, error, refetch }`.
- **Transformasi:** `filterByMatchScore(career_recommendations, 0.3)` (FR-020, VAL-008) + sort matched skills per kategori (FR-021).
- **Requirement:** FR-020, FR-021, VAL-008, API-013.

### 13.6 `useProfile`

- **Tujuan:** Fetch & update biodata; muat riwayat analisis.
- **State:** `profile: User | null`, `history: HistoryItem[]`, `isLoading`, `isSubmitting`, `error`.
- **Service:** `userService.getProfile()`, `userService.updateProfile()`, `analysisService.listAnalyses()`.
- **Return:** `{ profile, history, updateProfile, isLoading, isSubmitting, error, refetch }`.
- **Loading/Error:** `Skeleton` saat fetch; 409 email duplikat → error inline; sukses → `Toast`.
- **Requirement:** FR-022, FR-023, VAL-005, API-003, API-004, API-012.

### 13.7 `useCategories`

- **Tujuan:** Fetch referensi kategori karir (mis. untuk display name).
- **State:** `categories: Category[] = []`, `isLoading`, `error`.
- **Service:** `categoryService.getCategories()`.
- **Return:** `{ categories, isLoading, error, refetch }`.
- **Requirement:** FR-024, API-014.

> **Pola umum hook fetch:** seluruh hook fetch (`useDashboard`, `useAnalysis`, `useCareerRecs`, `useProfile`, `useCategories`) mengikuti pola `{ data, isLoading, error, refetch }` agar konsisten dan mudah diuji. `refetch` menjadi action retry untuk `ErrorState` (UI-014).

---

## 14. Store Design

### 14.1 Keputusan: Zustand vs Context API

Zustand dipilih sebagai global state manager dengan pertimbangan teknis berikut:

| Pertimbangan | Zustand | Context API |
|---|---|---|
| **Akses di luar React tree** | Bisa via `store.getState()` — krusial untuk `api.client.ts` interceptor membaca token tanpa hook. | Tidak bisa; Context hanya dapat dibaca dalam komponen via `useContext`. |
| **Re-render** | Selektif via selector (`useStore(s => s.token)`); hanya komponen yang memakai slice ter-update yang re-render. | Seluruh consumer re-render saat value provider berubah (rentan re-render berlebih). |
| **Boilerplate** | Minimal: satu `create()` tanpa provider wajib. | Perlu Provider, reducer/dispatch, dan plumbing manual. |
| **Persistensi** | Middleware `persist` siap pakai. | Manual. |

Faktor penentu utama: **interceptor Axios perlu membaca/menghapus token di luar komponen React** (request interceptor & penanganan 401). Zustand mendukung ini secara native melalui `getState()`/`setState()`.

### 14.2 `auth.store.ts`

- **State:** `token: string | null`, `user: User | null`, `isAuthenticated: boolean`.
- **Actions:** `setToken(token, user)`, `clearAuth()`.
- **Persistensi token — keputusan:** gunakan `localStorage` via middleware `persist` agar sesi bertahan saat refresh (UX baik untuk SPA). **Trade-off keamanan** (rentan XSS) dimitigasi dengan: tidak menyimpan data sensitif lain selain token, validasi input + tidak memakai `dangerouslySetInnerHTML` (§22), dan masa berlaku token yang dikelola backend (SEC-004). Alternatif (`sessionStorage`/in-memory) ditinjau di §22.

```typescript
// @/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setToken: (token, user) => set({ token, user, isAuthenticated: true }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: 'pathora-auth' }, // localStorage key
  ),
);
```

### 14.3 `ui.store.ts`

- **State:** `toasts: Toast[]`, `isGlobalLoading: boolean`.
- **Actions:** `addToast(toast)`, `removeToast(id)`, `showLoading()`, `hideLoading()`.
- **Penggunaan:** `Toast` container global di `App.tsx` membaca `toasts` dan merendernya (success/error state lintas halaman, §18).

```typescript
// @/store/ui.store.ts
import { create } from 'zustand';

interface ToastItem { id: string; type: 'success' | 'error' | 'info'; message: string; }
interface UIState {
  toasts: ToastItem[];
  isGlobalLoading: boolean;
  addToast: (t: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  showLoading: () => void;
  hideLoading: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isGlobalLoading: false,
  addToast: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  showLoading: () => set({ isGlobalLoading: true }),
  hideLoading: () => set({ isGlobalLoading: false }),
}));
```

### 14.4 Aturan Global State

| Boleh di Global Store | Tidak Boleh di Global Store |
|---|---|
| Auth: token, user, isAuthenticated (dibutuhkan lintas halaman + interceptor). | Data domain: daftar CV, detail analisis, rekomendasi karir. |
| UI feedback: toasts, global loading. | State form (cukup lokal di komponen/hook). |
| | State expand/collapse `CategoryCard` (lokal komponen). |

**Prinsip:** data domain bersifat *server state* yang terikat halaman tertentu → cukup dikelola hook (`useDashboard`, `useAnalysis`, dst.) dengan `refetch`. Menyimpannya global akan menimbulkan risiko data basi (stale) dan kompleksitas sinkronisasi yang tidak perlu. Global store dibatasi pada *client state* yang benar-benar lintas halaman (auth & UI feedback).


---

## 15. Authentication Flow

Autentikasi berbasis JWT. Frontend bertanggung jawab menyimpan token, menyisipkannya ke request, serta menangani logout dan kedaluwarsa. Validasi otoritatif tetap di backend (SEC-002, SEC-005).

### 15.1 Register

```
[RegisterPage/RegisterForm] isi field
  → validasi Zod registerSchema (VAL-001)
  → useAuth.register(payload) → authService.register() → POST /auth/register (API-001)
  → 201 sukses → ui.store.addToast("Registrasi berhasil, silakan login")
              → navigate("/login")                                  (UC-001)
  → 409/422 (email terdaftar/validasi) → error inline pada field   (FR-001)
```
Catatan: register **tidak** otomatis login; pengguna diarahkan ke `/login`.

### 15.2 Login

```
[LoginPage/LoginForm] isi email & password
  → validasi Zod loginSchema (VAL-002)
  → useAuth.login(payload) → authService.login() → POST /auth/login (API-002)
  → 200 { token, user } → auth.store.setToken(token, user)
  → redirect ke state.from (bila ada) atau "/dashboard"            (FR-002, UC-002)
  → 401 → pesan netral "Email atau password salah"
```

### 15.3 Attach Token ke Request

`api.client.ts` request interceptor membaca `token` dari `auth.store` via `getState()` dan menyisipkan `Authorization: Bearer <token>` ke setiap request (lihat §11.2). Tidak ada komponen yang menempelkan token secara manual.

### 15.4 ProtectedRoute

Membaca `isAuthenticated` dari `auth.store`. Bila `false` → `Navigate` ke `/login` dengan `state.from = location` untuk redirect-back setelah login (FR-004, UI-003, SEC-002). Implementasi pada §6.2.

### 15.5 PublicRoute

Membaca `isAuthenticated`. Bila `true` → `Navigate` ke `/dashboard` (mencegah halaman auth diakses saat sudah login). Implementasi pada §6.3.

### 15.6 Logout

```
[Sidebar] klik Logout → useAuth.logout()
  → auth.store.clearAuth()  (hapus token & user; persist localStorage ikut terhapus)
  → navigate("/login")                                             (FR-003, UC-003)
```

### 15.7 Token Expired / 401

```
Request privat dengan token kedaluwarsa
  → backend balas 401
  → response interceptor: auth.store.clearAuth() → redirect "/login"  (SEC-004)
```
Penanganan ini terpusat di interceptor sehingga seluruh halaman konsisten tanpa duplikasi (§11.3, §11.4).

---

## 16. Form Validation Design

Validasi frontend memakai **Zod** sebagai *single source of truth* yang diekspor dari `@/utils/validation.ts`. Validasi sisi klien bersifat *fail-fast* untuk UX; backend tetap menegakkan validasi otoritatif (SEC-005).

### 16.1 Integrasi Zod dengan Form Handler

Keputusan: gunakan **react-hook-form + `@hookform/resolvers/zod`** untuk mengikat schema Zod ke form. Alasan: mengurangi boilerplate state per field, dukungan validasi `onBlur`/`onSubmit`, dan integrasi error per field yang rapi. Bila tim memilih tanpa library form, alternatifnya adalah handler manual yang memanggil `schema.safeParse(values)` lalu memetakan `error.flatten().fieldErrors` ke state error — pola ini didokumentasikan sebagai fallback. Tipe form di-*infer* dari schema (`z.infer`) sehingga selaras dengan tipe payload service.

### 16.2 Skema Zod per Form

```typescript
// @/utils/validation.ts
import { z } from 'zod';

// VAL-001 — Register
export const registerSchema = z
  .object({
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

// VAL-002 — Login
export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

// VAL-003 — Upload CV teks (min karakter agar layak dianalisis)
export const cvTextSchema = z.object({
  raw_text: z.string().min(100, 'Teks CV minimal 100 karakter agar dapat dianalisis'),
});

// VAL-004 — Upload CV berkas (tipe & ukuran)
const MAX_FILE_MB = 5;
const ACCEPTED = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];
export const cvFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => ACCEPTED.includes(f.type), 'Tipe berkas harus PDF atau DOCX')
    .refine((f) => f.size <= MAX_FILE_MB * 1024 * 1024, `Ukuran berkas maksimal ${MAX_FILE_MB}MB`),
});

// VAL-005 — Edit biodata
export const profileSchema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
});
```

| Form | Schema | Aturan | Requirement |
|---|---|---|---|
| Register | `registerSchema` | `full_name` min 3; `email` valid (unik dicek backend → 409); `password` min 8; `confirmPassword` cocok | VAL-001, FR-001 |
| Login | `loginSchema` | `email` valid+wajib; `password` wajib | VAL-002, FR-002 |
| Upload teks | `cvTextSchema` | `raw_text` wajib, min 100 karakter | VAL-003, FR-008 |
| Upload berkas | `cvFileSchema` | tipe PDF/DOCX; ukuran ≤ 5MB | VAL-004, FR-009 |
| Edit biodata | `profileSchema` | `full_name` valid; `email` valid (unik dicek backend → 409) | VAL-005, FR-022 |

> **Keunikan email:** tidak dapat divalidasi penuh di klien. Frontend memvalidasi format; keunikan ditegakkan backend (409) dan dipetakan ke error inline pada field email.

### 16.3 Pesan Error Inline per Field (UI-004 s.d. UI-007)

- Setiap field merender pesan error di bawahnya (`Input.error` / `Textarea.error`).
- Error dari validasi Zod ditampilkan sebelum submit; error dari backend (mis. 409, 422 `fields`) dipetakan ke field terkait setelah respons.
- Tombol submit **disabled** saat form tidak valid atau sedang proses (UI-004, UI-006).

### 16.4 Kapan Validasi Dijalankan

| Momen | Perilaku | Alasan |
|---|---|---|
| **on-blur** | Validasi field saat pengguna meninggalkannya | Umpan balik dini tanpa mengganggu saat mengetik |
| **on-submit** | Validasi seluruh form sebelum kirim | Jaring pengaman akhir; cegah request tidak valid |
| (on-change) | Hanya untuk field yang sudah pernah error (re-validate) | Mengurangi noise; error hilang begitu diperbaiki |

Strategi `mode: 'onBlur'` + `reValidateMode: 'onChange'` (react-hook-form) memenuhi kombinasi di atas.

---

## 17. Error Handling Design

Seluruh error dinormalisasi ke pesan yang dapat ditampilkan melalui `parseApiError()` (§20) dan dirender konsisten (NFR-021, UI-014).

### 17.1 Tabel Penanganan Error

| Error | HTTP Status | Penanganan di Frontend | Komponen | Requirement |
|---|---|---|---|---|
| Validation error | 422 | Pesan inline per field (dari `error.fields`) | `Input`/`Textarea` error | VAL-001–005, UI-004–007 |
| Unauthorized | 401 | `clearAuth()` + redirect `/login` (interceptor) | — | SEC-002, SEC-004 |
| Forbidden | 403 | Pesan "Akses ditolak" | `ErrorState` | SEC-003 |
| Not found | 404 | `ErrorState` "Data tidak ditemukan" atau ke `NotFoundPage` | `ErrorState`/`NotFoundPage` | UI-014 |
| Server error | 500 | `ErrorState` + tombol retry | `ErrorState` | NFR-009, UI-014 |
| Network error | — | Pesan "Koneksi gagal" + retry | `ErrorState` | NFR-009, UI-014 |
| AI timeout | 504 | Pesan timeout + tombol "Coba lagi" (retry `triggerAnalysis`) | `AnalysisStatusBanner` | FR-013, NFR-003 |
| AI error | 502 | Pesan "Layanan analisis tidak tersedia" + retry | `AnalysisStatusBanner` | FR-013, NFR-009 |
| Upload failed | 413 / 422 | `FileValidationError` + saran fallback ke teks | `FileValidationError` | FR-009, VAL-004 |

### 17.2 `parseApiError()`

Fungsi `parseApiError(error)` di `@/utils/error.ts` dipakai **semua hook** untuk menormalisasi error Axios menjadi string siap tampil:

- Membedakan network error (tanpa `response`) → pesan koneksi (via `isNetworkError`).
- Memetakan status (401/403/404/422/500/502/504) ke pesan baku berbahasa Indonesia.
- Mengekstrak `error.message`/`error.fields` dari body `{ data, error, meta }` bila tersedia.
- Mengembalikan pesan default aman bila bentuk tidak dikenal (mencegah bocornya detail teknis ke pengguna).

Detail implementasi pada §20.

### 17.3 Prinsip Resiliensi (NFR-009)

Tidak ada error yang boleh menyebabkan crash. Setiap pemanggilan asinkron dibungkus `try/catch` di hook, menyetel `error` state, dan UI merender `ErrorState`/`AnalysisStatusBanner` dengan opsi retry. Error boundary global di `App.tsx` menangkap error render tak terduga sebagai jaring pengaman terakhir.

---

## 18. Loading, Empty, Success, and Retry State

State UI diterapkan konsisten di seluruh halaman (NFR-014, UI-012–014).

### 18.1 Loading State — `Spinner` vs `Skeleton`

| Gunakan `Skeleton` | Gunakan `Spinner` |
|---|---|
| Konten berstruktur jelas: list, card, chart (Dashboard, Analysis, Career, Profile). | Aksi singkat: submit form, tombol "Analisis", "Simpan". |
| Memberi gambaran tata letak sebelum data datang (mengurangi *layout shift*). | Indikator proses pada elemen aksi (tombol `isLoading`). |

Contoh: `DashboardPage` menampilkan `Skeleton variant="card"` untuk `AnalysisSummaryCard` dan `Skeleton variant="list"` untuk riwayat (UI-012).

### 18.2 Empty State — `EmptyState` (UI-013)

Digunakan ketika data kosong, dengan CTA tindak lanjut bila relevan:

| Kondisi | Pesan | CTA |
|---|---|---|
| Belum pernah upload CV (Dashboard) | "Belum ada analisis" | `UploadCTABanner` → `/upload` |
| Top predictions terfilter habis (`confidence ≤ 0.05`) | "Tidak ada prediksi yang memenuhi ambang" | — |
| Career recs terfilter habis (`match_score ≤ 0.3`) | "Belum ada rekomendasi kategori" | tautan kembali ke Analysis |
| Riwayat analisis kosong (Profile) | "Belum ada riwayat analisis" | `UploadCTABanner` |

### 18.3 Error State — `ErrorState` (UI-014)

Menampilkan pesan (hasil `parseApiError`) + tombol retry. Aturan retry:

- **Memanggil ulang service (`refetch`/`retry`)** untuk kegagalan fetch sementara (network, 500, 502, 504) — lebih cepat & menjaga konteks.
- **Reload halaman** hanya sebagai fallback ekstrem bila state korup; tidak menjadi default.

### 18.4 Success State — `Toast`

`Toast` mengonfirmasi aksi berhasil (simpan biodata, hapus CV, registrasi):

- **Durasi:** auto-dismiss ~3–4 detik.
- **Dismiss:** otomatis (timeout) atau manual (tombol tutup). Dikelola `ui.store` (`addToast`/`removeToast`).

### 18.5 ProgressBar (FR-010)

`ProgressBar` menampilkan progress unggah berkas berdasarkan `onUploadProgress` Axios (0–100%). Untuk input teks yang tidak memiliki progress nyata, gunakan `Spinner` pada tombol.

### 18.6 Retry Action

Setiap hook fetch mengekspos `refetch` (atau `retry`/`retryAnalysis`) yang diteruskan ke prop `onRetry` `ErrorState`/`AnalysisStatusBanner`. Dengan demikian retry terstandar di seluruh halaman tanpa logika ad-hoc.

---

## 19. Analysis Result Handling

Bagian ini merinci penanganan seluruh skenario hasil analisis sesuai FR-013, FR-014, FR-015, dan API Contract (PRD §10 / SRS DATA-005).

> **Prinsip wajib:** Frontend **tidak pernah** memanggil layanan AI langsung. Seluruh komunikasi AI melalui backend (BTS-04, SEC-011). Frontend hanya memanggil endpoint backend `POST /cvs/:cvId/analyze` dan `GET /analyses/:analysisId`.

### 19.1 Memicu Analisis

Setelah upload CV sukses dan memperoleh `cv_id`, `useCVUpload` memanggil `analysisService.triggerAnalysis(cvId)` → `POST /cvs/:cvId/analyze` (API-010) dengan `timeout = VITE_AI_TIMEOUT_MS` (NFR-003).

### 19.2 Strategi Menunggu Hasil

**Keputusan: await response langsung** (bukan polling). Endpoint `POST /cvs/:cvId/analyze` (API-010) mengembalikan hasil analisis pada response yang sama (200). Selama menunggu, UI menampilkan loading (`Spinner` pada tombol + opsional `AnalysisStatusBanner status="pending"`). Polling endpoint terpisah tidak digunakan pada MVP karena tidak ada endpoint status asinkron pada API Contract; status `pending` direpresentasikan sebagai keadaan request sedang berjalan.

### 19.3 Penanganan per Status / Kode

| Skenario | Trigger | Penanganan Frontend | Komponen | Requirement |
|---|---|---|---|---|
| **success** | 200, `status: "success"` | Redirect `/analysis/:analysisId`; `useAnalysis` fetch detail | (redirect) | FR-011, FR-013 |
| **failed** | 422, `status: "failed"` | `AnalysisStatusBanner` "Analisis gagal" + tombol coba lagi | `AnalysisStatusBanner` | FR-013, VAL-007 |
| **timeout** | 504 / Axios `ECONNABORTED` | Pesan timeout + retry `triggerAnalysis(cvId)` | `AnalysisStatusBanner` | FR-013, NFR-003 |
| **AI error** | 502 | Pesan "Layanan tidak tersedia" + retry | `AnalysisStatusBanner` | FR-013, NFR-009 |

Seluruh skenario gagal **tidak meng-crash** aplikasi dan selalu menyediakan retry (NFR-009).

### 19.4 Menampilkan Top 5 Predictions (FR-016)

```
analysis.top_5_predictions
  → utils/filter.filterByConfidence(items, 0.05)   // hanya confidence > 0.05
  → TopPredictionsChart (bar chart, label kategori + nilai confidence)
  → bila kosong setelah filter → EmptyState (UI-013)
```
Logika filter berada di `utils/filter.ts`, bukan di komponen (lihat §20, alasan keterujian).

### 19.5 Menampilkan Skill Gap (FR-017)

```
extracted_skills[topCategory].matched_skills
  → utils/sort.sortMatchedSkillsBySimilarity(skills)   // descending by similarity
  → MatchedSkillList
extracted_skills[topCategory].missing_skills
  → MissingSkillList
  → bila kosong → EmptyState
```

### 19.6 Menampilkan Career Recommendations (FR-020, FR-021)

```
analysis.career_recommendations
  → utils/filter.filterByMatchScore(items, 0.3)   // hanya match_score > 0.3
  → per kategori: gabung dengan extracted_skills kategori sama
  → render CategoryCard (expandable) → CategorySkillGap
  → matched_skills tiap kategori disort desc by similarity (FR-021)
  → bila kosong setelah filter → EmptyState
```

### 19.7 Menampilkan Career Description (FR-018)

```
analysis.description_career_recommendations
  → CareerDescriptionCard
  → bila null/kosong → placeholder informatif
    ("Deskripsi rekomendasi belum tersedia untuk analisis ini")
```

### 19.8 Catatan Konsistensi Filtering (VAL-008)

Aturan filtering tampilan (`confidence > 0.05`, `match_score > 0.3`, sort similarity desc) **wajib** ditegakkan via `utils/filter.ts` & `utils/sort.ts` di seluruh halaman yang menampilkan data analisis (Analysis & Career Recommendations), memastikan perilaku seragam dan teruji (VAL-008).

---

## 20. Utility Design

Seluruh utilitas adalah fungsi murni (tanpa efek samping, tanpa dependensi React) sehingga mudah diuji unit. Logika transformasi data **dipisahkan ke `utils/`**, bukan di dalam komponen, agar: (1) dapat diuji terisolasi (§21), (2) konsisten lintas halaman, (3) komponen tetap fokus pada rendering.

### 20.1 `format.ts`

| Fungsi | Tanda Tangan | Deskripsi |
|---|---|---|
| `formatDate` | `(iso: string) => string` | Format tanggal ISO → lokal terbaca (mis. "15 Jan 2025"). |
| `formatPercent` | `(value: number) => string` | Pecahan 0–1 → persen (`0.832` → "83.2%"). Untuk confidence/match_score. |
| `formatScore` | `(value: number, digits?: number) => string` | Format angka skor dengan presisi tetap. |
| `truncate` | `(text: string, max: number) => string` | Potong teks panjang + elipsis (mis. ringkasan deskripsi). |

### 20.2 `validation.ts`

Single source of truth seluruh Zod schema (lihat §16.2): `registerSchema`, `loginSchema`, `cvTextSchema`, `cvFileSchema`, `profileSchema`, beserta tipe `z.infer`. Form mengimpor schema dari sini dan mengikatnya via resolver. Mengubah aturan validasi cukup di satu tempat (VAL-001–005).

### 20.3 `filter.ts`

| Fungsi | Tanda Tangan | Requirement |
|---|---|---|
| `filterByConfidence` | `(items: TopPrediction[], threshold: number) => TopPrediction[]` | FR-016, VAL-008 |
| `filterByMatchScore` | `(items: CareerRecommendation[], threshold: number) => CareerRecommendation[]` | FR-020, VAL-008 |

```typescript
// @/utils/filter.ts
import type { TopPrediction, CareerRecommendation } from '@/types';

export const filterByConfidence = (items: TopPrediction[], threshold = 0.05) =>
  items.filter((i) => i.confidence > threshold);

export const filterByMatchScore = (items: CareerRecommendation[], threshold = 0.3) =>
  items.filter((i) => i.match_score > threshold);
```

**Alasan dipisah ke utils:** ambang `0.05`/`0.3` adalah aturan bisnis (VAL-008) yang harus konsisten dan teruji; menaruhnya di komponen akan menyulitkan pengujian dan berisiko duplikasi/inkonsistensi antar halaman.

### 20.4 `sort.ts`

| Fungsi | Tanda Tangan | Requirement |
|---|---|---|
| `sortMatchedSkillsBySimilarity` | `(skills: MatchedSkill[]) => MatchedSkill[]` (descending) | FR-017, FR-021 |

```typescript
// @/utils/sort.ts
import type { MatchedSkill } from '@/types';

export const sortMatchedSkillsBySimilarity = (skills: MatchedSkill[]) =>
  [...skills].sort((a, b) => b.similarity - a.similarity); // immutable, desc
```

### 20.5 `error.ts`

| Fungsi | Tanda Tangan | Deskripsi |
|---|---|---|
| `parseApiError` | `(error: unknown) => string` | Normalisasi error Axios → pesan siap tampil (Bahasa Indonesia). |
| `isNetworkError` | `(error: unknown) => boolean` | `true` bila error Axios tanpa `response` (kegagalan jaringan). |

```typescript
// @/utils/error.ts
import axios from 'axios';

export const isNetworkError = (error: unknown): boolean =>
  axios.isAxiosError(error) && !error.response;

export function parseApiError(error: unknown): string {
  if (isNetworkError(error)) return 'Koneksi gagal. Periksa jaringan Anda lalu coba lagi.';
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiMsg = (error.response?.data as { error?: { message?: string } })?.error?.message;
    switch (status) {
      case 401: return 'Sesi Anda berakhir. Silakan login kembali.';
      case 403: return 'Akses ditolak.';
      case 404: return apiMsg ?? 'Data tidak ditemukan.';
      case 422: return apiMsg ?? 'Input tidak valid.';
      case 502: return 'Layanan analisis sedang tidak tersedia. Coba lagi.';
      case 504: return 'Analisis memakan waktu terlalu lama. Coba lagi.';
      default:  return apiMsg ?? 'Terjadi kesalahan pada server. Coba lagi.';
    }
  }
  return 'Terjadi kesalahan tak terduga.';
}
```


---

## 21. Testing Design

### 21.1 Setup Testing

- **Library:** Vitest (test runner, native Vite), React Testing Library (RTL, pengujian berbasis perilaku), `@testing-library/user-event` (simulasi interaksi pengguna), `@testing-library/jest-dom` (matcher DOM).
- **Lingkungan:** `jsdom` dikonfigurasi via `vite.config.ts` (`test.environment = 'jsdom'`), `test.setupFiles` memuat `jest-dom` dan reset mock antar test.
- **Filosofi:** uji perilaku yang terlihat pengguna (teks, peran/role, interaksi), bukan detail implementasi. Setiap skenario memetakan acceptance criteria SRS.

### 21.2 Strategi Mock

**Mock service** — isolasi page dari jaringan:
```typescript
import { vi } from 'vitest';
vi.mock('@/services/analysis.service', () => ({
  analysisService: {
    getAnalysisById: vi.fn(),
    triggerAnalysis: vi.fn(),
    listAnalyses: vi.fn(),
  },
}));
```

**Mock Zustand store** — kontrol status auth/UI per test:
```typescript
import { useAuthStore } from '@/store/auth.store';
beforeEach(() => {
  useAuthStore.setState({ token: 't', user: { id: '1' } as never, isAuthenticated: true });
});
```

**Wrap routing** — gunakan `MemoryRouter` (atau `createMemoryRouter`) untuk page yang memakai `useParams`/`useNavigate`:
```typescript
render(
  <MemoryRouter initialEntries={['/analysis/abc']}>
    <Routes><Route path="/analysis/:analysisId" element={<AnalysisPage />} /></Routes>
  </MemoryRouter>,
);
```

**Mock Axios response** — bila menguji service, mock `apiClient` atau gunakan adapter mock; pada level page cukup mock service (lebih cepat & stabil).

### 21.3 Skenario Test per File

**`DashboardPage.test.tsx`** (FR-005, FR-007, UI-008, UI-013):
1. Menampilkan `EmptyState` + CTA upload saat `last_analysis === null` (belum ada analisis).
2. `AnalysisSummaryCard` menampilkan kategori & confidence yang benar saat data tersedia.
3. Klik "Lihat Analysis" pada item riwayat menavigasi ke `/analysis/:id` yang benar.

**`UploadPage.test.tsx`** (FR-008, FR-009, FR-010, VAL-003, VAL-004):
1. Teks < 100 karakter ditolak dengan pesan validasi; service tidak terpanggil.
2. Berkas dengan tipe tidak didukung (mis. `.png`) ditolak via `FileValidationError`.
3. Loading state (tombol disabled + `Spinner`) tampil saat analisis berjalan.

**`AnalysisPage.test.tsx`** (FR-016, FR-017, VAL-008, UI-013):
1. Item `confidence ≤ 0.05` tidak dirender di `TopPredictionsChart`.
2. `matched_skills` dirender terurut menurun berdasarkan `similarity`.
3. `EmptyState` muncul bila seluruh prediksi terfilter habis.

**`CareerRecommendationsPage.test.tsx`** (FR-020, FR-021, UI-010, UI-013):
1. Item `match_score ≤ 0.3` tidak ditampilkan.
2. `CategoryCard` dapat di-expand dan collapse (toggle detail skill).
3. `EmptyState` muncul bila seluruh kategori terfilter habis.

**`ProfilePage.test.tsx`** (FR-022, FR-023, VAL-005, UI-011):
1. Biodata tampil dengan data pengguna dari `getProfile`.
2. Submit dengan email duplikat (mock 409) menampilkan pesan error inline.
3. Klik item riwayat analisis menavigasi ke `AnalysisPage` terkait.

### 21.4 Contoh Test Case Lengkap (Template)

```typescript
// @/pages/Analysis/AnalysisPage.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AnalysisPage from '@/pages/Analysis/AnalysisPage';
import { analysisService } from '@/services/analysis.service';
import type { Analysis } from '@/types';

vi.mock('@/services/analysis.service', () => ({
  analysisService: { getAnalysisById: vi.fn() },
}));

const buildAnalysis = (over?: Partial<Analysis>): Analysis => ({
  id: 'abc',
  cv_id: 'cv1',
  status: 'success',
  analyzed_at: '2025-01-15T10:30:00Z',
  predicted_category: 'INFORMATION-TECHNOLOGY',
  confidence: 0.832,
  top_5_predictions: [
    { category: 'INFORMATION-TECHNOLOGY', confidence: 0.832 },
    { category: 'ENGINEERING', confidence: 0.04 }, // ≤ 0.05 → harus tersaring
  ],
  extracted_skills: [
    {
      category: 'INFORMATION-TECHNOLOGY',
      matched_skills: [
        { skill: 'Python', similarity: 0.92 },
        { skill: 'SQL', similarity: 0.70 },
      ],
      missing_skills: ['Project Management'],
    },
  ],
  career_recommendations: [{ category: 'INFORMATION-TECHNOLOGY', match_score: 0.832 }],
  description_career_recommendations: 'Deskripsi contoh.',
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/analysis/abc']}>
      <Routes>
        <Route path="/analysis/:analysisId" element={<AnalysisPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('AnalysisPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menyaring prediksi dengan confidence <= 0.05 (FR-016, VAL-008)', async () => {
    vi.mocked(analysisService.getAnalysisById).mockResolvedValue(buildAnalysis());
    renderPage();

    expect(await screen.findByText(/INFORMATION-TECHNOLOGY/i)).toBeInTheDocument();
    expect(screen.queryByText(/ENGINEERING/i)).not.toBeInTheDocument();
  });

  it('menampilkan matched_skills terurut menurun by similarity (FR-017)', async () => {
    vi.mocked(analysisService.getAnalysisById).mockResolvedValue(buildAnalysis());
    renderPage();

    const skills = await screen.findAllByTestId('matched-skill');
    expect(skills[0]).toHaveTextContent('Python'); // 0.92 sebelum SQL 0.70
    expect(skills[1]).toHaveTextContent('SQL');
  });

  it('menampilkan empty state bila semua prediksi tersaring (UI-013)', async () => {
    vi.mocked(analysisService.getAnalysisById).mockResolvedValue(
      buildAnalysis({ top_5_predictions: [{ category: 'X', confidence: 0.01 }] }),
    );
    renderPage();

    expect(await screen.findByText(/tidak ada prediksi/i)).toBeInTheDocument();
  });
});
```

---

## 22. Security Considerations Frontend

### 22.1 Protected Route (FR-004, SEC-002)

Halaman privat dibungkus `ProtectedRoute` yang menolak akses tanpa autentikasi (redirect `/login`). Ini adalah proteksi UX-level; otorisasi otoritatif tetap di backend (endpoint privat menolak 401/403). Frontend tidak pernah menjadi satu-satunya garis pertahanan.

### 22.2 Token Storage — Trade-off & Keputusan

| Opsi | Kelebihan | Kekurangan |
|---|---|---|
| `localStorage` | Persisten lintas refresh/tab; UX mulus. | Rentan XSS (skrip jahat dapat membaca). |
| `sessionStorage` | Tidak persisten setelah tab ditutup. | Tetap rentan XSS; sesi hilang saat refresh tab baru. |
| In-memory | Paling aman dari XSS (tidak tersimpan). | Hilang saat refresh; perlu refresh-token flow. |

**Keputusan:** gunakan **`localStorage`** (via Zustand `persist`) untuk MVP demi UX SPA yang persisten, dengan mitigasi: tidak ada data sensitif lain yang disimpan, tidak memakai `dangerouslySetInnerHTML`, validasi input ketat (Zod), dan masa berlaku token dikelola backend (SEC-004). Bila kebutuhan keamanan meningkat, jalur evolusi adalah memindahkan token ke cookie `HttpOnly` + refresh token (memerlukan dukungan backend).

### 22.3 Sanitasi Input

Sanitasi otoritatif ada di backend (SEC-005). Pencegahan sisi frontend:
- **Tidak** menggunakan `dangerouslySetInnerHTML`; seluruh teks (termasuk `description_career_recommendations`) dirender sebagai teks biasa (React meng-escape secara default).
- Validasi Zod sebelum mengirim data (VAL-001–005).

### 22.4 Data Sensitif

- Tidak menyimpan data sensitif di `localStorage` selain token sesi.
- Tidak melakukan `console.log` data sensitif di production (logging diatur agar tidak membocorkan token/PII).

### 22.5 Environment Variable (SEC-010)

Variabel `VITE_` **ter-bundle** ke build klien dan terlihat publik. Karena itu **dilarang** menyimpan secret (API key rahasia, secret JWT) di sana. Hanya konfigurasi non-rahasia (base URL, timeout) yang boleh.

### 22.6 File Upload Security (VAL-004)

`CVFileDropzone` memvalidasi **tipe MIME** (`application/pdf`, `...wordprocessingml.document`) dan **ukuran** sebelum mengirim — bukan sekadar ekstensi nama berkas. Validasi ini bersifat pencegahan dini; backend tetap memvalidasi ulang (SEC-005).

### 22.7 HTTPS (SEC-009)

Seluruh komunikasi ke backend memakai HTTPS di production. `api.client.ts` tidak perlu meng-*enforce* ini secara eksplisit, namun `VITE_API_BASE_URL` production **wajib** `https://` (dipastikan saat konfigurasi deploy).

---

## 23. Performance and Scalability Plan

### 23.1 Code Splitting & Lazy Loading (NFR-001)

Setiap page diimpor via `React.lazy()` dan dibungkus `<Suspense fallback={<Spinner/>}>` di `routes/index.tsx` (§6.4). Bundle awal hanya memuat shell aplikasi; kode halaman dimuat saat dibutuhkan, menjaga first load < 3 detik (NFR-001).

### 23.2 Reusable Components

Pemisahan `components/ui/` (general-purpose, tanpa logika domain) vs `components/[feature]/` (domain-specific) memungkinkan komponen UI dipakai ulang lintas fitur tanpa perubahan, menekan duplikasi dan memudahkan penambahan halaman baru (skalabilitas pengembangan).

### 23.3 Centralized API Client

Satu instance Axios di `api.client.ts` memusatkan baseURL, header, interceptor, dan timeout. Perubahan lintas-aplikasi (mis. menambah header, mengubah penanganan 401) dilakukan di satu tempat tanpa menyentuh service/hook (maintainability, §2.3).

### 23.4 Type-safe Response

`ApiResponse<T>` dan tipe domain memastikan seluruh konsumsi API type-safe, mengurangi runtime error dan memperjelas kontrak data antar tim (NFR-016, NFR-020).

### 23.5 Pagination

Endpoint riwayat mendukung `limit/offset` (API-007 `/cvs`, API-012 `/analyses`). **Strategi:** gunakan **paginasi `limit/offset`** (mis. limit 10) pada `AnalysisHistoryList` dan daftar CV. Alasan memilih limit/offset dibanding infinite scroll: lebih sederhana, deterministik, dan cocok untuk riwayat yang ditinjau (bukan feed). `meta.total` dari respons dipakai untuk kontrol halaman. Infinite scroll dapat menjadi peningkatan P2 bila volume data tumbuh besar.

### 23.6 Optimistic UI

- **Hapus CV (`deleteCV`)** adalah kandidat *optimistic update*: item langsung dihilangkan dari list sebelum respons backend; bila gagal, item dikembalikan + `Toast` error (*rollback*).
- **Trade-off:** optimistic UI meningkatkan responsivitas terasa, tetapi menambah kompleksitas rollback. Diterapkan **hanya** pada aksi berisiko rendah & reversibel (hapus). Aksi kritikal seperti analisis (`triggerAnalysis`) **tidak** optimistic karena hasilnya tidak dapat diprediksi (bergantung AI).

### 23.7 Accessibility (NFR-015)

- **Semantic HTML:** `<button>`, `<nav>`, `<main>`, `<header>`, `<form>`, `<label>` digunakan sesuai peran.
- **`aria-label`** pada elemen interaktif tanpa teks (mis. hamburger, tombol tutup `Modal`/`Toast`).
- **Kontras warna** memadai mengikuti palet Tailwind (cek Lighthouse Accessibility).
- **Keyboard navigation:** form dapat dinavigasi via Tab; `Modal` mengelola fokus (focus trap) dan dapat ditutup dengan `Esc`.

---

## 24. Mapping SRS to Frontend Design

Tabel berikut menelusuri seluruh requirement SRS yang berdampak ke frontend menuju artefak desain (page, component, hook/service). Requirement yang murni backend (mis. SEC-001 hashing, SEC-006 SQL injection) tidak dipetakan ke frontend tetapi dihormati melalui kontrak API.

### 24.1 Functional Requirements (FR)

| Req ID | Deskripsi Singkat | Frontend Page | Component | Hook / Service | Catatan |
|---|---|---|---|---|---|
| FR-001 | Registrasi pengguna | RegisterPage | RegisterForm, Input, Button | useAuth / auth.service.register | VAL-001; 409 → inline email |
| FR-002 | Login | LoginPage | LoginForm | useAuth / auth.service.login | Simpan token; redirect dashboard |
| FR-003 | Logout & sesi | (Sidebar) | Sidebar | useAuth.logout / auth.store.clearAuth | Hapus token → /login |
| FR-004 | Proteksi halaman privat | (semua privat) | ProtectedRoute | auth.store | Redirect /login + state.from |
| FR-005 | Card ringkasan analisis terakhir | DashboardPage | AnalysisSummaryCard, EmptyState | useDashboard / dashboard.service | Empty state bila null |
| FR-006 | CTA Upload CV | DashboardPage | UploadCTABanner | — (navigasi) | Ke /upload |
| FR-007 | Daftar riwayat upload | DashboardPage | UploadHistoryList/Item | useDashboard / dashboard.service | "Lihat Analysis" → /analysis/:id |
| FR-008 | Unggah CV teks | UploadPage | CVTextInput, UploadMethodTabs | useCVUpload / cv.service.uploadCV | VAL-003 |
| FR-009 | Unggah CV berkas | UploadPage | CVFileDropzone, FileValidationError | useCVUpload / cv.service.uploadCV | VAL-004; fallback teks |
| FR-010 | Validasi & loading upload | UploadPage | ProgressBar, Spinner | useCVUpload | Disable submit ganda |
| FR-011 | Pemicuan analisis pasca-upload | UploadPage→AnalysisPage | AnalysisStatusBanner | useCVUpload / analysis.service.triggerAnalysis | Redirect saat sukses |
| FR-012 | Daftar & hapus CV | (Profile/Dashboard) | UploadHistoryList | cv.service.listCVs/deleteCV | Optimistic delete (§23.6) |
| FR-013 | Orkestrasi & resiliensi analisis | UploadPage / AnalysisPage | AnalysisStatusBanner, ErrorState | useCVUpload, useAnalysis | 504/502/422 + retry |
| FR-014 | Penyimpanan hasil analisis | (konsumsi) AnalysisPage | — | analysis.service.getAnalysisById | Data dari backend |
| FR-015 | Mock adapter AI | — (backend) | — | — | FE agnostik mock vs nyata (NFR-020) |
| FR-016 | Top 5 predictions (filter >0.05) | AnalysisPage | TopPredictionsChart | useAnalysis / utils.filterByConfidence | VAL-008 |
| FR-017 | Skill gap prediksi teratas | AnalysisPage | MatchedSkillList, MissingSkillList | useAnalysis / utils.sortMatchedSkillsBySimilarity | Sort desc |
| FR-018 | Deskripsi karir strategis | AnalysisPage | CareerDescriptionCard | useAnalysis | Placeholder bila kosong |
| FR-019 | Navigasi ke rekomendasi karir | AnalysisPage | PageHeader (action) | — (navigasi) | Ke /career-recommendations/:id |
| FR-020 | Seluruh kategori (filter >0.3) | CareerRecommendationsPage | CategoryCard, CareerRecsFilter | useCareerRecs / utils.filterByMatchScore | VAL-008 |
| FR-021 | Skill gap per kategori (expandable) | CareerRecommendationsPage | CategoryCard, CategorySkillGap | useCareerRecs / utils.sort | Expand/collapse |
| FR-022 | Lihat & edit biodata | ProfilePage | ProfileBioForm | useProfile / user.service.get/updateProfile | VAL-005; 409 inline |
| FR-023 | Riwayat analisis di Profile | ProfilePage | AnalysisHistoryList/Item | useProfile / analysis.service.listAnalyses | Item → AnalysisPage |
| FR-024 | Data referensi kategori | (lintas) | — | useCategories / category.service | Display name kategori |
| FR-025 | Health check | — (backend) | — | — | Tidak ditampilkan di UI |

### 24.2 Non-Functional Requirements (NFR) berdampak frontend

| Req ID | Deskripsi Singkat | Frontend Page | Component | Hook / Service | Catatan |
|---|---|---|---|---|---|
| NFR-001 | First load < 3 dtk | (semua) | Suspense + Spinner | routes/index (React.lazy) | Code splitting (§23.1) |
| NFR-003 | Timeout endpoint analyze | UploadPage/AnalysisPage | AnalysisStatusBanner | analysis.service (timeout=AI_TIMEOUT_MS) | 504 graceful |
| NFR-009 | Resiliensi kegagalan AI | UploadPage/AnalysisPage | ErrorState, AnalysisStatusBanner | useCVUpload, useAnalysis | No crash + retry |
| NFR-013 | Desain responsif | (semua) | AppLayout, Sidebar, Navbar | — | Tailwind breakpoints (§9.7) |
| NFR-014 | Umpan balik & state UI | (semua) | Spinner, Skeleton, EmptyState, ErrorState, Toast | semua hook | §18 |
| NFR-015 | Aksesibilitas dasar | (semua) | ui/* (semantic + aria) | — | §23.7 |
| NFR-016 | Kualitas kode & tooling | — | — | — | ESLint + tsc + vite build |
| NFR-019 | Kompatibilitas browser | (semua) | — | vite build target es2020 | §3.7 |
| NFR-020 | Konsistensi kontrak integrasi | AnalysisPage/Career | — | analysis.service + types | Mock=nyata (FR-015) |
| NFR-021 | Penanganan error konsisten | (semua) | ErrorState | api.client interceptor + parseApiError | Format {data,error,meta} |

### 24.3 User Interface Requirements (UI)

| Req ID | Deskripsi Singkat | Frontend Page | Component | Hook / Service | Catatan |
|---|---|---|---|---|---|
| UI-001 | Sitemap (rute publik & privat) | (semua) | routes/index | — | §6.1 |
| UI-002 | Navigasi global | (privat) | Sidebar, Navbar | — | Dashboard/Upload/Profile/Logout |
| UI-003 | Proteksi rute FE | (privat) | ProtectedRoute | auth.store | Redirect /login |
| UI-004 | Form Register | RegisterPage | RegisterForm, Input | useAuth | Inline error + disable submit |
| UI-005 | Form Login | LoginPage | LoginForm, Input | useAuth | Tautan ke Register |
| UI-006 | Form Upload CV | UploadPage | UploadMethodTabs, CVTextInput, CVFileDropzone | useCVUpload | Loading saat analisis |
| UI-007 | Form Edit Biodata | ProfilePage | ProfileBioForm | useProfile | Konfirmasi via Toast |
| UI-008 | Dashboard Utama | DashboardPage | AnalysisSummaryCard, UploadCTABanner, UploadHistoryList | useDashboard | Empty state |
| UI-009 | Halaman Analysis | AnalysisPage | TopPredictionsChart, SkillGapSection, CareerDescriptionCard | useAnalysis | Filter + empty |
| UI-010 | Halaman Rekomendasi Karir | CareerRecommendationsPage | CategoryCard, CategorySkillGap | useCareerRecs | Expand/collapse |
| UI-011 | Halaman Profile | ProfilePage | ProfileBioForm, AnalysisHistoryList | useProfile | Riwayat → Analysis |
| UI-012 | Loading/Skeleton | (semua) | Spinner, Skeleton | semua hook | §18.1 |
| UI-013 | Empty state | Dashboard/Analysis/Career/Profile | EmptyState | hook terkait | CTA bila relevan |
| UI-014 | Error/Retry state | (semua) | ErrorState, AnalysisStatusBanner | refetch/retry | §18.3 |
| UI-015 | Konsistensi desain & responsif | (semua) | Card, PageHeader, layout/* | — | Design system Tailwind |

### 24.4 Validation Requirements (VAL)

| Req ID | Deskripsi Singkat | Frontend Page | Component | Hook / Service / Util | Catatan |
|---|---|---|---|---|---|
| VAL-001 | Validasi registrasi | RegisterPage | RegisterForm | registerSchema (validation.ts) | confirmPassword cocok |
| VAL-002 | Validasi login | LoginPage | LoginForm | loginSchema | email valid+wajib |
| VAL-003 | Validasi upload teks | UploadPage | CVTextInput | cvTextSchema | min 100 karakter |
| VAL-004 | Validasi upload berkas | UploadPage | CVFileDropzone, FileValidationError | cvFileSchema | MIME PDF/DOCX + ukuran |
| VAL-005 | Validasi edit biodata | ProfilePage | ProfileBioForm | profileSchema | email valid; 409 unik |
| VAL-006 | Validasi parameter & path | Analysis/Career | — | guard param di hook | format cvId/analysisId |
| VAL-007 | Validasi respons AI (schema) | — (backend) | AnalysisStatusBanner | useCVUpload (status failed) | FE tampilkan failed + retry |
| VAL-008 | Aturan filtering tampilan | Analysis/Career | TopPredictionsChart, CategoryCard | utils.filter / utils.sort | >0.05, >0.3, sort desc |

### 24.5 Security Requirements (SEC) berdampak frontend

| Req ID | Deskripsi Singkat | Frontend Page | Component | Hook / Service | Catatan |
|---|---|---|---|---|---|
| SEC-002 | Autentikasi JWT | (privat) | ProtectedRoute | api.client (Bearer), auth.store | §11.2, §15.3 |
| SEC-003 | Otorisasi kepemilikan | (privat) | ErrorState (403) | parseApiError | FE tampilkan "Akses ditolak" |
| SEC-004 | Manajemen token | (semua) | — | auth.store, interceptor 401 | Logout & 401 → clearAuth |
| SEC-005 | Validasi & sanitasi input | form pages | (form components) | Zod (validation.ts) | FE fail-fast; backend otoritatif |
| SEC-007 | Kebijakan CORS | — | — | — | Backend; FE pakai baseURL benar |
| SEC-009 | Proteksi komunikasi (HTTPS) | (semua) | — | api.client baseURL | VITE_API_BASE_URL https:// prod |
| SEC-010 | Pengelolaan rahasia | — | — | constants/environment | Tanpa secret di VITE_ |
| SEC-011 | Isolasi layanan AI | UploadPage/AnalysisPage | — | analysis.service (via backend) | FE tak pernah panggil AI langsung |

---

*Dokumen ini diturunkan dari PRD Path`Ora v1.2 dan SRS Path`Ora v1.0 — 30 Mei 2026. Seluruh keputusan desain frontend mengacu pada requirement ID di kedua dokumen tersebut dan konsisten dengan struktur folder `pathora-frontend/` yang telah ditetapkan.*
