# Path`Ora Backend — Postman Collection

Koleksi Postman untuk pengujian seluruh endpoint Backend Path`Ora (F1–F7).

## File

| File                                          | Keterangan                                             |
| --------------------------------------------- | ------------------------------------------------------ |
| `PathOra-Backend.postman_collection.json`     | Collection utama — semua endpoint + test scripts       |
| `PathOra-Local.postman_environment.json`      | Environment untuk local development (`localhost:3000`) |
| `PathOra-Production.postman_environment.json` | Environment untuk production (ganti `baseUrl`)         |

---

## Cara Import ke Postman

1. Buka Postman → klik **Import** (pojok kiri atas)
2. Drag & drop **kedua file** sekaligus, atau pilih satu per satu:
   - `PathOra-Backend.postman_collection.json`
   - `PathOra-Local.postman_environment.json`
3. Setelah import, pilih environment **Path`Ora — Local Development** dari dropdown kanan atas
4. Pastikan server backend sudah berjalan (`npm run dev` di folder `pathora-backend/`)

---

## Alur Pengujian yang Disarankan

Jalankan request **secara berurutan** agar variable environment terisi otomatis:

```
1. 🔐 Auth → Register
   └─ Mengisi: registerEmail, registerPassword

2. 🔐 Auth → Login
   └─ Mengisi: authToken, currentUserId  ← WAJIB sebelum endpoint lain

3. 📄 CVs → Upload CV — Text
   └─ Mengisi: cvId

4. 🤖 Analyses → Trigger Analysis
   └─ Mengisi: analysisId

5. 🤖 Analyses → Get Analysis by ID
   └─ Verifikasi hasil analisis + aturan filter

6. 📊 Dashboard → Get My Dashboard
   └─ Verifikasi lastAnalysis & recentHistory

7. 👤 Users → Get My Profile / Update My Profile
```

---

## Variable Environment

| Variable        | Diisi Oleh              | Keterangan                                  |
| --------------- | ----------------------- | ------------------------------------------- |
| `baseUrl`       | Manual                  | URL server, default `http://localhost:3000` |
| `authToken`     | Auto (Login)            | JWT Bearer token                            |
| `loginEmail`    | Manual                  | Email akun untuk login                      |
| `loginPassword` | Manual                  | Password akun untuk login                   |
| `registerEmail` | Auto (Register pre-req) | Email unik per run                          |
| `currentUserId` | Auto (Login)            | UUID user aktif                             |
| `cvId`          | Auto (Upload CV Text)   | UUID CV teks terakhir                       |
| `cvIdFile`      | Auto (Upload CV File)   | UUID CV file terakhir                       |
| `analysisId`    | Auto (Trigger Analysis) | UUID analisis terakhir                      |
| `otherUserCvId` | Manual                  | UUID CV milik user lain (untuk uji 403)     |

---

## Apa yang Diuji (Test Scripts)

Setiap request memiliki **test script otomatis** yang memverifikasi:

### Auth

- ✅ Status code sesuai (201 register, 200 login, 401 salah kredensial)
- ✅ Response shape `{ data, error, meta }` konsisten
- ✅ `password_hash` tidak pernah muncul di response (SEC-001)
- ✅ Token JWT memiliki 3 segmen base64

### CVs

- ✅ Upload teks < 100 karakter → 422 (VAL-003)
- ✅ List CV tidak menyertakan `file_data`/`raw_text` (efisiensi NFR-011)
- ✅ cvId bukan UUID → 422 (VAL-006)

### Analyses

- ✅ Semua field kontrak AI ada (`predicted_category`, `confidence`, dll.)
- ✅ `confidence` antara 0–1
- ✅ `top_5_predictions` — semua item `confidence > 0.05` (FR-016)
- ✅ `career_recommendations` — semua item `match_score > 0.3` (FR-020)
- ✅ `matched_skills` terurut descending by `similarity` (FR-017)
- ✅ CV tidak ditemukan → 404

### Security

- ✅ Tanpa token → 401
- ✅ Token invalid → 401
- ✅ Akses resource milik user lain → 403/404
- ✅ Endpoint tidak ada → 404

---

## Catatan Penggunaan Mock AI

Jika server berjalan dengan `USE_MOCK_AI=true` (default development), endpoint
`POST /cvs/:cvId/analyze` akan mengembalikan payload hardcoded yang sudah sesuai
kontrak AI. Semua test script tetap berjalan normal.

Untuk menguji dengan AI nyata, set `USE_MOCK_AI=false` dan pastikan `AI_BASE_URL`
sudah dikonfigurasi di `.env`.

---

## Menjalankan Collection via CLI (Newman)

```bash
# Install Newman
npm install -g newman

# Jalankan collection dengan environment local
newman run PathOra-Backend.postman_collection.json \
  -e PathOra-Local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```
