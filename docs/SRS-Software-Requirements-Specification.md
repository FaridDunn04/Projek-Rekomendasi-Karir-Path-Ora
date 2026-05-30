# Software Requirements Specification (SRS)

> **Software Requirements Specification**
> Platform End-to-End Kesiapan Kerja dengan Dashboard Strategis & Rekomendasi Jalur Karir Otomatis

| Field | Value |
|---|---|
| **Nama Produk** | Path`Ora |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 30 Mei 2026 |
| **Status** | Draft untuk Review |
| **Dokumen Acuan** | PRD Path`Ora v1.2 (Full Stack Development) |
| **Lingkup** | Spesifikasi Kebutuhan Sistem (Full Stack: Frontend + Backend + Integrasi AI/ML) |

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen Software Requirements Specification (SRS) ini bertujuan untuk menerjemahkan kebutuhan produk yang tercantum pada Product Requirements Document (PRD) Path`Ora menjadi kebutuhan sistem yang detail, jelas, tidak ambigu, dan dapat diuji. Dokumen ini menjadi acuan tunggal (single source of truth) bagi tim pengembang, penjamin mutu (QA), dan pemangku kepentingan dalam proses perancangan, implementasi, pengujian, serta verifikasi sistem.

Secara spesifik, dokumen ini:
1. Mendefinisikan kebutuhan fungsional dan non-fungsional sistem secara terstruktur.
2. Menetapkan kriteria penerimaan (acceptance criteria) untuk setiap fitur utama.
3. Menyediakan dasar penelusuran (traceability) antara kebutuhan produk pada PRD dan kebutuhan sistem pada SRS.
4. Memberikan batasan dan asumsi yang membatasi ruang lingkup pengembangan sistem.

### 1.2 Ruang Lingkup Sistem

Path`Ora adalah platform web yang membantu pencari kerja (khususnya fresh graduate dan career switcher di bidang IT & Data) untuk memahami tingkat kesiapan kerja serta memperoleh rekomendasi jalur karir yang relevan berdasarkan analisis CV.

Ruang lingkup sistem yang dispesifikasikan dalam dokumen ini meliputi:
- **Frontend SPA** berbasis React + TypeScript + Vite + Tailwind CSS dengan komunikasi data melalui Axios.
- **Backend RESTful API** berbasis Node.js + Express dengan persistensi data ke PostgreSQL.
- **Integrasi layanan AI/ML** melalui kontrak API yang telah disepakati (HTTP), termasuk penanganan kegagalan agar sistem tetap resilient.
- **Autentikasi & otorisasi** berbasis JWT.
- **Manajemen CV** (unggah teks/berkas), penyimpanan hasil analisis, serta penyajian hasil dalam bentuk visualisasi dan rekomendasi.
- **Deployment** frontend dan backend ke layanan hosting.

Hal-hal yang **berada di luar lingkup** sistem ini: pembuatan/pelatihan model ML/NLP, pipeline data science, scraping lowongan real-time, aplikasi mobile native, fitur sosial/komunitas, marketplace, dan pembayaran.

### 1.3 Definisi, Akronim, dan Singkatan

| Istilah | Penjelasan |
|---|---|
| **SRS** | Software Requirements Specification — dokumen spesifikasi kebutuhan perangkat lunak |
| **PRD** | Product Requirements Document — dokumen kebutuhan produk |
| **CV** | Curriculum Vitae — daftar riwayat hidup yang dianalisis sistem |
| **AI/ML** | Artificial Intelligence / Machine Learning |
| **NLP** | Natural Language Processing |
| **JWT** | JSON Web Token — mekanisme token autentikasi |
| **API** | Application Programming Interface |
| **REST** | Representational State Transfer — gaya arsitektur API |
| **SPA** | Single Page Application |
| **FE / BE** | Frontend / Backend |
| **INT** | Integrasi (komponen yang berhubungan dengan layanan AI/ML) |
| **JSONB** | Tipe data biner JSON pada PostgreSQL |
| **CTA** | Call To Action — elemen ajakan bertindak pada UI |
| **confidence** | Tingkat keyakinan model terhadap kategori prediksi (0–1) |
| **match_score** | Skor kecocokan kategori karir terhadap profil CV (0–1) |
| **matched_skills** | Skill yang dimiliki pengguna dan relevan dengan kategori |
| **missing_skills** | Skill yang perlu ditambahkan pengguna untuk suatu kategori |
| **skill gap** | Selisih antara skill yang dimiliki dan skill yang dibutuhkan |
| **FR / NFR** | Functional Requirement / Non-Functional Requirement |
| **UI / UC** | User Interface / Use Case |
| **MVP** | Minimum Viable Product |
| **CORS** | Cross-Origin Resource Sharing |

### 1.4 Referensi Dokumen

1. **PRD — Path`Ora (Fokus: Full Stack Development)** versi 1.2, 29 Mei 2026 — `docs/PRD-Full-Stack-Development.md`.
2. **API Contract Backend ↔ AI** — tercantum pada PRD §10.
3. **Model Data (PostgreSQL)** — tercantum pada PRD §11.
4. Konvensi RESTful API dan kode status HTTP standar (RFC 7231).
5. Standar JSON Web Token (RFC 7519).

### 1.5 Overview Sistem

Sistem terdiri atas tiga lapisan utama yang saling terhubung:

1. **Lapisan Frontend (Client):** SPA responsif yang menampilkan halaman publik (Register, Login) dan halaman privat (Dashboard, Upload, Analysis, Rekomendasi Karir, Profile). Frontend hanya berkomunikasi dengan Backend, tidak pernah memanggil layanan AI secara langsung.
2. **Lapisan Backend (Server):** RESTful API yang menangani autentikasi, manajemen CV, orkestrasi analisis, validasi data, penanganan error, serta persistensi ke PostgreSQL. Backend adalah satu-satunya komponen yang berkomunikasi dengan layanan AI/ML.
3. **Lapisan Layanan AI/ML (Eksternal):** Microservice HTTP yang menerima teks CV dan mengembalikan hasil analisis sesuai API Contract. Selama layanan AI belum tersedia, Backend menggunakan adapter/mock yang mengembalikan payload sesuai kontrak.

Alur inti sistem: pengguna mengunggah CV → Backend menyimpan CV → Backend memicu analisis ke layanan AI → hasil disimpan ke database → Frontend menampilkan hasil dalam bentuk visualisasi (chart kategori, skill gap, rekomendasi karir).


---

## 2. Deskripsi Umum

### 2.1 Perspektif Produk

Path`Ora merupakan produk baru (greenfield) yang berdiri sebagai platform web mandiri. Sistem mengikuti arsitektur tiga lapis (three-tier):

- **Presentation tier:** Frontend SPA (React + Vite) yang di-deploy ke Vercel.
- **Application tier:** Backend RESTful API (Express) yang di-deploy ke layanan yang mendukung Node + PostgreSQL.
- **Data tier:** PostgreSQL sebagai penyimpanan utama (users, cvs, analyses, categories), dengan kolom JSONB untuk payload hasil AI agar fleksibel terhadap perubahan model. Object storage opsional untuk berkas CV.

Sistem terintegrasi dengan layanan AI/ML eksternal melalui kontrak API. Backend bertindak sebagai gateway tunggal menuju layanan AI sehingga Frontend tidak pernah berinteraksi langsung dengan AI.

### 2.2 Fungsi Utama Produk

Fungsi utama yang harus disediakan sistem:
1. **Autentikasi & Manajemen Sesi** — Registrasi, login, logout berbasis JWT, serta proteksi halaman privat.
2. **Dashboard Utama** — Ringkasan analisis terakhir (kategori prediksi teratas + confidence), CTA Upload CV, dan riwayat upload.
3. **Upload & Manajemen CV** — Unggah CV via teks atau berkas (PDF/DOCX), validasi, dan pemicu analisis.
4. **Analisis CV via AI/ML** — Orkestrasi pengiriman teks CV ke layanan AI, penyimpanan hasil, dan penanganan kegagalan tanpa crash.
5. **Halaman Analysis** — Visualisasi Top 5 prediksi kategori, analisis skill gap dari prediksi teratas, dan deskripsi rekomendasi karir strategis.
6. **Halaman Rekomendasi Karir** — Seluruh prediksi kategori beserta analisis skill gap per kategori.
7. **Halaman Profile** — Biodata pengguna (lihat/edit) dan riwayat analisis CV.
8. **Dashboard Agregat (Admin/Internal)** — Statistik agregat (total CV dianalisis, distribusi kategori, rata-rata confidence) — opsional/prioritas rendah.

### 2.3 Karakteristik Pengguna

| Segmen | Karakteristik | Kebutuhan Utama |
|---|---|---|
| **Fresh Graduate (IT/Data)** | Baru lulus, literasi digital dasar, belum tahu posisi yang cocok | Validasi arah karir & skill gap dengan UX cepat dan jelas |
| **Career Switcher** | Berasal dari latar belakang non-IT, ingin pindah ke bidang IT/Data | Roadmap skill yang relevan dan seberapa jauh gap-nya |
| **Job Seeker Aktif** | Sedang melamar banyak posisi | Optimasi CV agar sesuai target role |
| **Admin/Tim Internal** | Tim pengembang/pengelola | Memantau metrik agregat dan kesehatan sistem |

Seluruh pengguna mengakses sistem melalui browser desktop maupun mobile sehingga antarmuka wajib responsif dan minim friksi.

### 2.4 Role/Aktor Sistem

| Kode Aktor | Aktor | Deskripsi | Hak Akses Ringkas |
|---|---|---|---|
| **ACT-01** | **Guest (Pengunjung)** | Pengguna belum terautentikasi | Akses halaman publik (Register, Login), endpoint referensi kategori, dan health check |
| **ACT-02** | **Registered User (Pengguna Terdaftar)** | Pengguna yang telah login | Mengelola CV miliknya, memicu analisis, melihat dashboard/analysis/rekomendasi, mengelola biodata |
| **ACT-03** | **Admin/Internal** | Pengelola sistem | Hak Registered User + akses dashboard agregat (opsional/P2) |
| **ACT-04** | **AI/ML Service (Sistem Eksternal)** | Layanan inferensi AI | Menerima teks CV dan mengembalikan hasil analisis sesuai API Contract |

> Catatan: Pemisahan peran Admin bersifat opsional (P2). Pada MVP, sistem cukup membedakan Guest dan Registered User.

### 2.5 Batasan Sistem

1. **BTS-01** — Dataset analisis berasal dari CV Kaggle; kategori difokuskan pada bidang IT & Data, namun model dapat mengembalikan kategori lain (ENGINEERING, FINANCE, dll) sesuai contract.
2. **BTS-02** — Model AI bersifat baseline–menengah; latensi inferensi diasumsikan beberapa detik sehingga sistem wajib menyediakan loading state dan penanganan timeout.
3. **BTS-03** — Layanan AI tersedia sebagai endpoint HTTP terpisah (microservice). Bila belum siap, Backend wajib menyediakan mock response sesuai contract.
4. **BTS-04** — Frontend tidak boleh memanggil layanan AI secara langsung; seluruh komunikasi AI melalui Backend.
5. **BTS-05** — Sistem berupa aplikasi web; tidak menyediakan aplikasi mobile native.
6. **BTS-06** — Sistem tidak mencakup pelatihan/penyetelan model, pipeline data science, scraping lowongan, pembayaran, maupun integrasi pihak ketiga (LinkedIn, dll).
7. **BTS-07** — Frontend wajib dibangun dengan module bundler Vite; networking via Axios; Backend wajib RESTful (Express) dengan persistensi PostgreSQL.
8. **BTS-08** — Struktur respons API konsisten dalam format `{ data, error, meta }`.

### 2.6 Asumsi dan Dependensi

**Asumsi:**
1. Pengguna memiliki CV dalam format teks atau berkas (PDF/DOCX).
2. Pengguna mengakses melalui browser modern dengan koneksi internet.
3. Pengguna memiliki literasi digital dasar.
4. Payload hasil AI mengikuti API Contract pada PRD §10.

**Dependensi:**
1. Ketersediaan layanan AI/ML (atau mock adapter) yang mematuhi API Contract.
2. Ketersediaan instance PostgreSQL terkelola.
3. Ketersediaan layanan hosting (Vercel untuk FE; Railway/Render/Fly.io untuk BE + Postgres).
4. Variabel environment (kredensial DB, secret JWT, base URL layanan AI, konfigurasi timeout) tersedia pada setiap environment.


---

## 3. Functional Requirements

Setiap kebutuhan fungsional ditulis dengan atribut: ID, Nama, Deskripsi, Aktor, Prioritas (P0/P1/P2), dan Acceptance Criteria. Prioritas mengacu pada PRD §6 (P0 = MVP wajib, P1 = penting, P2 = nice-to-have).

### 3.1 Autentikasi & Manajemen Sesi (F1)

#### FR-001 — Registrasi Pengguna
- **Deskripsi:** Sistem harus memungkinkan Guest mendaftar dengan biodata dasar (nama lengkap, email, password) dan menyimpan password dalam bentuk hash.
- **Aktor:** Guest (ACT-01)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Diberikan email yang valid dan belum terdaftar serta password memenuhi aturan, ketika Guest mengirim form registrasi, maka sistem membuat akun baru dan mengembalikan respons sukses (201).
  - Diberikan email yang sudah terdaftar, ketika registrasi dikirim, maka sistem menolak dengan pesan error yang jelas (409/422) tanpa membuat duplikat.
  - Password tidak pernah disimpan atau dikembalikan dalam bentuk teks asli.

#### FR-002 — Login Pengguna
- **Deskripsi:** Sistem harus mengautentikasi pengguna berdasarkan email dan password, lalu menerbitkan JWT bila kredensial valid.
- **Aktor:** Guest (ACT-01)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Diberikan kredensial valid, ketika login dikirim, maka sistem mengembalikan token JWT dan data dasar pengguna (200).
  - Diberikan kredensial tidak valid, ketika login dikirim, maka sistem mengembalikan error 401 tanpa membocorkan informasi apakah email atau password yang salah.
  - Setelah login berhasil, pengguna diarahkan ke Dashboard Utama.

#### FR-003 — Logout & Manajemen Sesi
- **Deskripsi:** Sistem harus memungkinkan pengguna logout (menghapus token dari sisi klien) dan mengakhiri sesi.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Ketika pengguna logout, maka token dihapus dari penyimpanan klien dan pengguna diarahkan ke halaman Login.
  - Setelah logout, permintaan ke endpoint privat menggunakan sesi lama ditolak (401).

#### FR-004 — Proteksi Halaman & Endpoint Privat
- **Deskripsi:** Sistem harus melindungi seluruh halaman dan endpoint privat; akses tanpa autentikasi valid dialihkan/ditolak.
- **Aktor:** Registered User (ACT-02), Guest (ACT-01)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Diberikan pengguna belum terautentikasi, ketika mengakses halaman privat, maka Frontend mengalihkan ke `/login`.
  - Diberikan token tidak ada/kedaluwarsa/tidak valid, ketika mengakses endpoint privat, maka Backend mengembalikan 401.

### 3.2 Dashboard Utama (F2)

#### FR-005 — Card Ringkasan Analisis Terakhir
- **Deskripsi:** Sistem harus menampilkan kategori prediksi teratas (`predicted_category`) dan `confidence` dari analisis CV terakhir pengguna pada Dashboard Utama.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Diberikan pengguna memiliki minimal satu analisis sukses, ketika membuka Dashboard, maka card menampilkan kategori prediksi teratas dan nilai confidence yang sesuai data terakhir.
  - Diberikan pengguna belum pernah melakukan analisis, ketika membuka Dashboard, maka ditampilkan empty state yang informatif beserta ajakan Upload CV.

#### FR-006 — CTA Upload CV
- **Deskripsi:** Sistem harus menyediakan tombol/CTA utama pada Dashboard yang mengarahkan pengguna ke Halaman Upload.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Ketika pengguna menekan CTA "Upload CV", maka sistem menavigasikan ke halaman `/upload`.

#### FR-007 — Daftar Riwayat Upload
- **Deskripsi:** Sistem harus menampilkan daftar CV/analisis terakhir (tanggal, kategori prediksi, confidence) dengan aksi "Lihat Analysis".
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Diberikan pengguna memiliki riwayat, ketika membuka Dashboard, maka daftar riwayat tampil terurut dari yang terbaru beserta metadata (tanggal, kategori, confidence).
  - Ketika pengguna menekan "Lihat Analysis" pada salah satu item, maka sistem membuka Halaman Analysis terkait.
  - Diberikan riwayat kosong, maka ditampilkan empty state.

### 3.3 Upload & Manajemen CV (F3)

#### FR-008 — Unggah CV (Teks)
- **Deskripsi:** Sistem harus memungkinkan pengguna mengunggah CV dengan menempelkan teks.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Diberikan teks CV yang memenuhi panjang minimum, ketika dikirim, maka sistem menyimpan CV dan mengembalikan `cv_id` (201).
  - Diberikan teks kosong atau di bawah panjang minimum, ketika dikirim, maka sistem menolak dengan pesan validasi (422).

#### FR-009 — Unggah CV (Berkas PDF/DOCX)
- **Deskripsi:** Sistem harus memungkinkan pengguna mengunggah berkas PDF/DOCX yang kemudian diekstrak menjadi teks.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Diberikan berkas dengan tipe yang didukung dan ukuran dalam batas, ketika diunggah, maka sistem mengekstrak teks dan menyimpan CV.
  - Diberikan tipe berkas tidak didukung atau ukuran melebihi batas, ketika diunggah, maka sistem menolak dengan pesan validasi yang jelas (422) dan menyarankan input teks sebagai fallback.

#### FR-010 — Validasi & Loading State Upload
- **Deskripsi:** Sistem harus memvalidasi input upload serta menampilkan progress/loading state selama proses.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Selama proses upload/analisis berlangsung, maka UI menampilkan indikator loading dan menonaktifkan tombol kirim ganda.
  - Validasi tipe & ukuran berkas dilakukan sebelum pengiriman ke Backend.

#### FR-011 — Pemicuan Analisis Setelah Upload
- **Deskripsi:** Setelah CV diunggah, sistem harus memicu proses analisis dan mengarahkan pengguna ke Halaman Analysis saat selesai.
- **Aktor:** Registered User (ACT-02), AI/ML Service (ACT-04)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Ketika upload sukses, maka sistem memicu analisis (`POST /cvs/:cvId/analyze`).
  - Ketika analisis sukses, maka pengguna diarahkan ke `/analysis/:analysisId`.
  - Ketika analisis gagal, maka pengguna menerima pesan kegagalan dan opsi coba lagi (lihat FR-013).

#### FR-012 — Daftar & Hapus CV
- **Deskripsi:** Sistem harus memungkinkan pengguna melihat daftar CV miliknya, melihat detail satu CV, dan menghapus CV.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Pengguna hanya dapat melihat dan menghapus CV miliknya sendiri.
  - Ketika CV dihapus, maka CV tidak lagi muncul pada daftar/riwayat.

### 3.4 Analisis CV via AI/ML (F4)

#### FR-013 — Orkestrasi Analisis & Resiliensi
- **Deskripsi:** Backend harus mengirim teks CV ke layanan AI, menerima respons sesuai API Contract, menyimpan hasil, dan menangani kegagalan (timeout, layanan down, respons tidak valid) tanpa membuat sistem crash.
- **Aktor:** Registered User (ACT-02), AI/ML Service (ACT-04)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Diberikan layanan AI merespons valid, ketika analisis dipicu, maka Backend menyimpan hasil (status `success`) dan mengembalikan 200.
  - Diberikan layanan AI timeout (> ambang konfigurabel), maka Backend mengembalikan 504 dan FE menampilkan opsi coba lagi tanpa crash.
  - Diberikan layanan AI error/5xx, maka Backend mengembalikan 502 dengan pesan fallback dan opsi retry.
  - Diberikan respons AI tidak sesuai schema, maka Backend mengembalikan 422, mencatat log, dan menandai analisis `failed`.

#### FR-014 — Penyimpanan Hasil Analisis
- **Deskripsi:** Sistem harus menyimpan payload hasil analisis lengkap beserta metadata (kategori prediksi, confidence, status, waktu analisis).
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Hasil analisis tersimpan dan dapat diambil kembali melalui endpoint analisis.
  - Metadata utama (predicted_category, confidence, status, analyzed_at) tersimpan terpisah agar mudah ditampilkan pada dashboard/riwayat.

#### FR-015 — Mock Adapter Layanan AI
- **Deskripsi:** Selama layanan AI belum tersedia, Backend harus menyediakan mock response yang sesuai API Contract untuk mendukung pengembangan paralel.
- **Aktor:** AI/ML Service (ACT-04)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Ketika mode mock aktif, maka Backend mengembalikan payload valid sesuai contract sehingga seluruh alur FE/BE dapat diuji tanpa layanan AI nyata.

### 3.5 Halaman Analysis (F5)

#### FR-016 — Visualisasi Top 5 Predictions
- **Deskripsi:** Sistem harus menampilkan Top 5 prediksi kategori dalam bentuk bar chart dengan filter ambang `confidence > 0.05`.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Hanya item dengan confidence > 0.05 yang ditampilkan.
  - Diberikan seluruh item terfilter habis, maka ditampilkan empty state informatif.
  - Bar chart menampilkan label kategori dan nilai confidence yang dapat dibaca.

#### FR-017 — Skill Gap Analysis dari Prediksi Teratas
- **Deskripsi:** Sistem harus menampilkan skill yang dimiliki (`matched_skills` + similarity, terurut menurun) dan skill yang perlu ditambahkan (`missing_skills`) untuk kategori prediksi teratas.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - `matched_skills` ditampilkan terurut menurun berdasarkan similarity.
  - `missing_skills` ditampilkan sebagai daftar skill yang perlu ditingkatkan.
  - Diberikan daftar kosong, maka ditampilkan empty state.

#### FR-018 — Deskripsi Rekomendasi Karir Strategis
- **Deskripsi:** Sistem harus menampilkan teks naratif rekomendasi karir (`description_career_recommendations`) dari AI.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Teks deskripsi tampil utuh dan terbaca.
  - Diberikan deskripsi kosong/tidak tersedia, maka ditampilkan placeholder yang informatif.

#### FR-019 — Navigasi ke Halaman Rekomendasi Karir
- **Deskripsi:** Sistem harus menyediakan tautan dari Halaman Analysis menuju Halaman Rekomendasi Karir untuk detail seluruh kategori.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Ketika pengguna menekan tautan, maka sistem membuka `/career-recommendations/:analysisId` untuk analisis yang sama.

### 3.6 Halaman Rekomendasi Karir (F6)

#### FR-020 — Daftar Keseluruhan Prediksi Kategori
- **Deskripsi:** Sistem harus menampilkan seluruh prediksi kategori (`career_recommendations`) dengan filter `match_score > 0.3`.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Hanya kategori dengan match_score > 0.3 yang ditampilkan.
  - Diberikan seluruh item terfilter habis, maka ditampilkan empty state.

#### FR-021 — Skill Gap Analysis per Kategori
- **Deskripsi:** Untuk setiap kategori, sistem harus menampilkan skill gap analysis lengkap (matched vs missing skills), disajikan sebagai daftar/kartu yang dapat di-expand.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Setiap kartu kategori dapat di-expand/collapse untuk menampilkan detail skill.
  - matched_skills terurut menurun berdasarkan similarity.

### 3.7 Halaman Profile (F7)

#### FR-022 — Lihat & Edit Biodata
- **Deskripsi:** Sistem harus menampilkan biodata pengguna (nama, email, dsb.) dan memungkinkan pengeditan biodata.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Ketika pengguna membuka Profile, maka biodata terkini tampil.
  - Ketika pengguna menyimpan perubahan biodata valid, maka data diperbarui dan konfirmasi ditampilkan.
  - Perubahan email yang melanggar keunikan ditolak dengan pesan jelas.

#### FR-023 — Riwayat Analisis CV pada Profile
- **Deskripsi:** Sistem harus menampilkan daftar lengkap analisis yang pernah dilakukan pengguna, yang dapat dibuka kembali ke Halaman Analysis.
- **Aktor:** Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Daftar riwayat tampil lengkap dan terurut.
  - Ketika item dipilih, maka sistem membuka Halaman Analysis terkait.

### 3.8 Dashboard Agregat Admin (F8)

#### FR-024 — Statistik Agregat (Opsional)
- **Deskripsi:** Sistem dapat menampilkan total CV dianalisis, distribusi kategori prediksi, dan rata-rata confidence untuk Admin/Internal.
- **Aktor:** Admin/Internal (ACT-03)
- **Prioritas:** P2
- **Acceptance Criteria:**
  - Ketika Admin membuka dashboard agregat, maka statistik agregat ditampilkan secara ringkas.
  - Akses dibatasi untuk peran Admin.

### 3.9 Data Referensi & Operasional

#### FR-025 — Data Referensi Kategori
- **Deskripsi:** Sistem harus menyediakan data referensi kategori karir (kode, nama tampilan, deskripsi).
- **Aktor:** Guest (ACT-01), Registered User (ACT-02)
- **Prioritas:** P1
- **Acceptance Criteria:**
  - Endpoint kategori mengembalikan daftar kategori beserta atributnya.

#### FR-026 — Health Check
- **Deskripsi:** Sistem harus menyediakan endpoint health check untuk observability.
- **Aktor:** Guest (ACT-01), Admin/Internal (ACT-03)
- **Prioritas:** P0
- **Acceptance Criteria:**
  - Ketika endpoint `/health` dipanggil, maka sistem mengembalikan status kesehatan (200) tanpa autentikasi.


---

## 4. Non-Functional Requirements

### 4.1 Performance

#### NFR-001 — Waktu Muat Frontend
- **Deskripsi:** First load Frontend harus < 3 detik pada koneksi normal; bundle dioptimasi oleh Vite.
- **Prioritas:** P1
- **Acceptance Criteria:** Hasil pengukuran (mis. Lighthouse) menunjukkan first load < 3 detik dan skor Performance ≥ 80.

#### NFR-002 — Latensi Endpoint Non-AI
- **Deskripsi:** Endpoint yang tidak bergantung pada AI harus merespons < 300 ms pada kondisi normal.
- **Prioritas:** P1
- **Acceptance Criteria:** Pengukuran p95 latensi endpoint non-AI < 300 ms pada beban normal.

#### NFR-003 — Latensi Endpoint Analyze
- **Deskripsi:** Endpoint analyze bergantung pada layanan AI dengan timeout konfigurabel (mis. 30 detik).
- **Prioritas:** P0
- **Acceptance Criteria:** Timeout dapat dikonfigurasi via environment; saat melewati ambang, sistem mengembalikan 504 secara graceful.

#### NFR-004 — Waktu Upload hingga Hasil (Mock AI)
- **Deskripsi:** Dengan mock AI, waktu dari upload hingga hasil tampil harus < 2 detik.
- **Prioritas:** P1
- **Acceptance Criteria:** Pengujian alur dengan mock AI menunjukkan waktu < 2 detik.

### 4.2 Security

#### NFR-005 — Penyimpanan Password Aman
- **Deskripsi:** Password harus disimpan menggunakan hashing kuat (mis. bcrypt) dan tidak pernah disimpan/dikembalikan dalam teks asli.
- **Prioritas:** P0
- **Acceptance Criteria:** Inspeksi database menunjukkan hanya hash; tidak ada endpoint yang mengembalikan password.

#### NFR-006 — Autentikasi Berbasis JWT
- **Deskripsi:** Endpoint privat harus dilindungi JWT dengan masa berlaku dan secret yang dikelola via environment.
- **Prioritas:** P0
- **Acceptance Criteria:** Permintaan tanpa token valid ke endpoint privat ditolak (401).

#### NFR-007 — Validasi Input & Proteksi Injeksi
- **Deskripsi:** Seluruh input harus divalidasi di Backend; query database harus terparameterisasi untuk mencegah injeksi.
- **Prioritas:** P0
- **Acceptance Criteria:** Input tidak valid ditolak (422); tidak ada query yang menyambung string input mentah.

#### NFR-008 — CORS & Rate Limiting Dasar
- **Deskripsi:** Sistem harus menerapkan kebijakan CORS yang sesuai dan rate limiting dasar untuk mencegah penyalahgunaan.
- **Prioritas:** P1
- **Acceptance Criteria:** Origin tidak diizinkan ditolak; permintaan berlebihan dibatasi dengan respons yang sesuai (429).

### 4.3 Availability

#### NFR-009 — Resiliensi terhadap Kegagalan AI
- **Deskripsi:** Kegagalan layanan AI tidak boleh meng-crash aplikasi; harus selalu ada fallback dan opsi retry (mengacu BR-7).
- **Prioritas:** P0
- **Acceptance Criteria:** Saat AI down/timeout/respons invalid, aplikasi tetap berjalan dan menampilkan pesan fallback dengan retry; tidak terjadi crash.

#### NFR-010 — Ketersediaan Layanan Inti
- **Deskripsi:** Layanan Backend dan Frontend harus tersedia secara publik setelah deployment dan menyediakan health check untuk pemantauan.
- **Prioritas:** P1
- **Acceptance Criteria:** URL publik dapat diakses; `/health` mengembalikan status sehat.

### 4.4 Scalability

#### NFR-011 — Skalabilitas Data & Query
- **Deskripsi:** Skema data harus mendukung pertumbuhan jumlah pengguna, CV, dan analisis dengan indeks yang memadai pada kolom yang sering di-query.
- **Prioritas:** P1
- **Acceptance Criteria:** Query riwayat/analisis tetap efisien seiring bertambahnya data melalui pengindeksan yang tepat.

#### NFR-012 — Arsitektur Tanpa Status (Stateless) pada API
- **Deskripsi:** Backend API harus stateless (otentikasi via token) sehingga dapat di-scale horizontal.
- **Prioritas:** P1
- **Acceptance Criteria:** Tidak ada state sesi yang disimpan di memori server yang menghambat penskalaan horizontal.

### 4.5 Usability

#### NFR-013 — Desain Responsif
- **Deskripsi:** Seluruh halaman harus responsif pada breakpoint mobile (≤640px), tablet (641–1024px), dan desktop (>1024px).
- **Prioritas:** P0
- **Acceptance Criteria:** Tata letak tetap fungsional dan terbaca pada ketiga kategori breakpoint.

#### NFR-014 — Umpan Balik & State UI
- **Deskripsi:** Sistem harus menyediakan loading state, empty state, dan error/retry state yang konsisten pada seluruh alur.
- **Prioritas:** P0
- **Acceptance Criteria:** Setiap proses asinkron menampilkan indikator status; kondisi kosong/gagal ditangani dengan tampilan informatif.

#### NFR-015 — Aksesibilitas Dasar
- **Deskripsi:** UI harus memiliki kontras memadai dan label aria pada elemen interaktif.
- **Prioritas:** P1
- **Acceptance Criteria:** Pemeriksaan aksesibilitas dasar (mis. Lighthouse Best Practices/Accessibility) memenuhi ambang yang ditetapkan.

### 4.6 Maintainability

#### NFR-016 — Kualitas Kode & Tooling
- **Deskripsi:** Kode harus lulus lint dan build (`vite build`, `tsc`) serta mengikuti standar ESLint/Prettier.
- **Prioritas:** P1
- **Acceptance Criteria:** Pipeline build & lint berhasil tanpa error.

#### NFR-017 — Dokumentasi API
- **Deskripsi:** API harus terdokumentasi (OpenAPI/Swagger atau README endpoint lengkap).
- **Prioritas:** P1
- **Acceptance Criteria:** Dokumentasi tersedia dan konsisten dengan implementasi endpoint.

#### NFR-018 — Fleksibilitas Skema Hasil AI
- **Deskripsi:** Payload hasil AI disimpan sebagai JSONB agar fleksibel terhadap perubahan model, disertai validasi schema.
- **Prioritas:** P1
- **Acceptance Criteria:** Perubahan struktur non-kritikal pada payload AI tidak merusak penyimpanan; validasi schema tetap berjalan.

### 4.7 Compatibility

#### NFR-019 — Kompatibilitas Browser
- **Deskripsi:** Aplikasi harus berjalan pada browser desktop dan mobile modern.
- **Prioritas:** P1
- **Acceptance Criteria:** Fungsi utama berjalan normal pada browser modern terkini (Chrome, Firefox, Edge, Safari).

#### NFR-020 — Konsistensi Kontrak Integrasi
- **Deskripsi:** Sistem harus kompatibel dengan API Contract Backend ↔ AI (PRD §10) baik untuk layanan nyata maupun mock.
- **Prioritas:** P0
- **Acceptance Criteria:** Output mock dan nyata dapat diproses oleh komponen yang sama tanpa perubahan kode.

### 4.8 Reliability

#### NFR-021 — Penanganan Error Konsisten
- **Deskripsi:** Sistem harus menggunakan format respons konsisten `{ data, error, meta }` dan kode status yang tepat.
- **Prioritas:** P0
- **Acceptance Criteria:** Seluruh endpoint mengembalikan struktur respons konsisten dan kode status sesuai konvensi.

#### NFR-022 — Logging & Observability
- **Deskripsi:** Sistem harus mencatat log request dan error untuk keperluan diagnosa.
- **Prioritas:** P1
- **Acceptance Criteria:** Error penting tercatat dalam log; tersedia endpoint `/health`.

#### NFR-023 — Tingkat Keberhasilan Analisis
- **Deskripsi:** Tingkat keberhasilan analisis (sukses/total) harus ≥ 95% di luar kegagalan yang berasal dari layanan AI.
- **Prioritas:** P1
- **Acceptance Criteria:** Pengukuran menunjukkan rasio keberhasilan ≥ 95% pada kondisi layanan AI normal.


---

## 5. User Interface Requirements

Bagian ini menjelaskan kebutuhan halaman, navigasi, form, umpan balik UI, validasi tampilan, dan state UI. Penomoran menggunakan prefiks **UI-xxx**.

### 5.1 Struktur Halaman & Navigasi

#### UI-001 — Peta Halaman (Sitemap)
- **Deskripsi:** Frontend harus menyediakan halaman publik (`/register`, `/login`) dan halaman privat (`/dashboard`, `/upload`, `/analysis/:analysisId`, `/career-recommendations/:analysisId`, `/profile`).
- **Acceptance Criteria:** Seluruh rute tersedia dan dapat diakses sesuai status autentikasi.

#### UI-002 — Navigasi Global
- **Deskripsi:** Sistem harus menyediakan sidebar/navbar berisi tautan ke Dashboard, Upload, Profile, dan Logout. Halaman Analysis & Rekomendasi Karir diakses dari Dashboard/Riwayat.
- **Acceptance Criteria:** Navigasi global tampil pada seluruh halaman privat dan berfungsi mengarahkan ke tujuan yang benar.

#### UI-003 — Proteksi Rute Frontend
- **Deskripsi:** Rute privat harus dilindungi; pengguna belum login dialihkan ke `/login`.
- **Acceptance Criteria:** Mengakses rute privat tanpa autentikasi mengalihkan ke Login.

### 5.2 Form & Validasi Tampilan

#### UI-004 — Form Register
- **Deskripsi:** Form registrasi harus memuat field nama, email, password, dan konfirmasi password dengan validasi tampilan (email valid, password minimal, konfirmasi cocok).
- **Acceptance Criteria:** Pesan validasi tampil inline pada field yang bermasalah; tombol submit dinonaktifkan saat form tidak valid atau sedang proses.

#### UI-005 — Form Login
- **Deskripsi:** Form login harus memuat field email dan password serta tautan ke halaman Register.
- **Acceptance Criteria:** Error kredensial ditampilkan jelas; tautan ke Register berfungsi.

#### UI-006 — Form Upload CV
- **Deskripsi:** Halaman Upload harus menyediakan area tempel teks dan/atau area drag-drop berkas PDF/DOCX serta tombol "Analisis".
- **Acceptance Criteria:** Validasi tipe/ukuran berkas ditampilkan sebelum submit; teks minimum divalidasi; tombol Analisis menampilkan loading state saat diproses.

#### UI-007 — Form Edit Biodata
- **Deskripsi:** Halaman Profile harus menyediakan form edit biodata dengan validasi tampilan.
- **Acceptance Criteria:** Perubahan tersimpan menampilkan konfirmasi; error validasi tampil inline.

### 5.3 Visualisasi & Penyajian Data

#### UI-008 — Dashboard Utama
- **Deskripsi:** Dashboard harus menampilkan card Ringkasan Analisis Terakhir (kategori prediksi + confidence), CTA Upload CV, dan daftar Riwayat Upload.
- **Acceptance Criteria:** Komponen tampil sesuai data; empty state muncul bila belum ada analisis.

#### UI-009 — Halaman Analysis
- **Deskripsi:** Halaman Analysis harus menampilkan bar chart Top 5 predictions (filter confidence > 0.05), skill gap analysis (dimiliki vs perlu ditambah), dan deskripsi rekomendasi karir strategis.
- **Acceptance Criteria:** Chart dan daftar skill tampil sesuai aturan filtering; empty state tampil bila data kosong setelah filter.

#### UI-010 — Halaman Rekomendasi Karir
- **Deskripsi:** Halaman harus menampilkan seluruh kategori (filter match_score > 0.3) sebagai daftar/kartu yang dapat di-expand beserta skill gap per kategori.
- **Acceptance Criteria:** Kartu kategori dapat di-expand/collapse; matched_skills terurut menurun berdasarkan similarity.

#### UI-011 — Halaman Profile
- **Deskripsi:** Halaman Profile harus menampilkan biodata (lihat/edit) dan riwayat analysis CV yang dapat dibuka kembali.
- **Acceptance Criteria:** Biodata dan riwayat tampil; item riwayat dapat membuka Halaman Analysis.

### 5.4 State UI & Umpan Balik

#### UI-012 — Loading/Skeleton State
- **Deskripsi:** Sistem harus menampilkan loading atau skeleton saat menunggu respons asinkron (upload, analyze, fetch data).
- **Acceptance Criteria:** Indikator loading tampil selama proses dan hilang saat selesai.

#### UI-013 — Empty State
- **Deskripsi:** Sistem harus menampilkan empty state informatif saat tidak ada data (belum ada CV/analisis, hasil terfilter habis).
- **Acceptance Criteria:** Empty state tampil dengan pesan jelas dan, bila relevan, CTA tindak lanjut.

#### UI-014 — Error/Retry State
- **Deskripsi:** Sistem harus menampilkan pesan error yang dapat dipahami dan opsi coba lagi saat terjadi kegagalan (mis. analisis gagal/timeout).
- **Acceptance Criteria:** Pesan error dan tombol retry tampil tanpa menyebabkan crash; pengguna dapat mengulang aksi.

#### UI-015 — Konsistensi Desain & Responsif
- **Deskripsi:** UI harus konsisten mengikuti design system Tailwind (spacing, radius, palet) dan responsif di mobile, tablet, desktop.
- **Acceptance Criteria:** Tampilan konsisten antarhalaman dan tetap fungsional pada seluruh breakpoint.

---

## 6. API Requirements

Bagian ini menjelaskan kebutuhan API secara konseptual mengikuti konvensi RESTful (mengacu PRD §9). Base URL: `/api/v1`. Seluruh respons mengikuti struktur konsisten `{ data, error, meta }`. Penomoran menggunakan prefiks **API-xxx**.

### API-001 — Registrasi
- **Tujuan:** Mendaftarkan pengguna baru.
- **Method / Endpoint:** `POST /auth/register`
- **Auth:** Tidak
- **Request data:** `full_name`, `email`, `password`.
- **Response data:** Data pengguna dasar (tanpa password); status 201.
- **Error case:** 422 (validasi gagal), 409 (email sudah terdaftar).

### API-002 — Login
- **Tujuan:** Mengautentikasi pengguna dan menerbitkan JWT.
- **Method / Endpoint:** `POST /auth/login`
- **Auth:** Tidak
- **Request data:** `email`, `password`.
- **Response data:** `token` (JWT) + data pengguna dasar; status 200.
- **Error case:** 401 (kredensial salah), 422 (validasi gagal).

### API-003 — Ambil Profil Pengguna
- **Tujuan:** Mengambil biodata pengguna saat ini.
- **Method / Endpoint:** `GET /users/me`
- **Auth:** Ya
- **Request data:** —
- **Response data:** Biodata pengguna (id, nama, email, dsb.); status 200.
- **Error case:** 401 (tidak terautentikasi).

### API-004 — Update Profil Pengguna
- **Tujuan:** Memperbarui biodata pengguna.
- **Method / Endpoint:** `PATCH /users/me`
- **Auth:** Ya
- **Request data:** Field biodata yang dapat diubah (mis. `full_name`, `email`).
- **Response data:** Biodata terbaru; status 200.
- **Error case:** 401, 409 (email duplikat), 422 (validasi gagal).

### API-005 — Data Dashboard
- **Tujuan:** Menyediakan data Dashboard Utama (ringkasan analisis terakhir + ringkasan riwayat upload).
- **Method / Endpoint:** `GET /dashboard/me`
- **Auth:** Ya
- **Request data:** —
- **Response data:** Ringkasan analisis terakhir (predicted_category, confidence) + daftar riwayat ringkas; status 200.
- **Error case:** 401.

### API-006 — Upload CV
- **Tujuan:** Menyimpan CV (teks/berkas) dan mengembalikan `cv_id`.
- **Method / Endpoint:** `POST /cvs`
- **Auth:** Ya
- **Request data:** `source_type` ('text' | 'file'), `raw_text` (untuk teks) atau berkas (untuk file).
- **Response data:** `cv_id` dan metadata CV; status 201.
- **Error case:** 401, 422 (validasi tipe/ukuran/teks), 413 (berkas terlalu besar).

### API-007 — Daftar CV
- **Tujuan:** Mengambil daftar CV milik pengguna (riwayat upload).
- **Method / Endpoint:** `GET /cvs`
- **Auth:** Ya
- **Request data:** Parameter paginasi opsional (`limit`, `offset`).
- **Response data:** Daftar CV; status 200.
- **Error case:** 401.

### API-008 — Detail CV
- **Tujuan:** Mengambil detail satu CV.
- **Method / Endpoint:** `GET /cvs/:cvId`
- **Auth:** Ya
- **Request data:** `cvId` pada path.
- **Response data:** Detail CV; status 200.
- **Error case:** 401, 403 (bukan milik pengguna), 404 (tidak ditemukan).

### API-009 — Hapus CV
- **Tujuan:** Menghapus CV milik pengguna.
- **Method / Endpoint:** `DELETE /cvs/:cvId`
- **Auth:** Ya
- **Request data:** `cvId` pada path.
- **Response data:** Konfirmasi penghapusan; status 200/204.
- **Error case:** 401, 403, 404.

### API-010 — Trigger Analisis CV
- **Tujuan:** Memicu analisis AI atas CV dan menyimpan hasil.
- **Method / Endpoint:** `POST /cvs/:cvId/analyze`
- **Auth:** Ya
- **Request data:** `cvId` pada path.
- **Response data:** Hasil analisis sesuai API Contract (predicted_category, confidence, top_5_predictions, extracted_skills, career_recommendations, description); status 200.
- **Error case:** 401, 404, 422 (respons AI tidak valid), 502 (AI error), 504 (AI timeout).

### API-011 — Hasil Analisis Terbaru dari CV
- **Tujuan:** Mengambil hasil analisis terbaru sebuah CV.
- **Method / Endpoint:** `GET /cvs/:cvId/analysis`
- **Auth:** Ya
- **Request data:** `cvId` pada path.
- **Response data:** Hasil analisis terbaru; status 200.
- **Error case:** 401, 403, 404.

### API-012 — Riwayat Analisis
- **Tujuan:** Mengambil riwayat analisis pengguna (untuk Profile & Dashboard).
- **Method / Endpoint:** `GET /analyses`
- **Auth:** Ya
- **Request data:** Parameter paginasi opsional (`limit`, `offset`).
- **Response data:** Daftar analisis; status 200.
- **Error case:** 401.

### API-013 — Detail Analisis
- **Tujuan:** Mengambil detail satu analisis (untuk Halaman Analysis & Rekomendasi Karir).
- **Method / Endpoint:** `GET /analyses/:analysisId`
- **Auth:** Ya
- **Request data:** `analysisId` pada path.
- **Response data:** Payload analisis lengkap sesuai API Contract; status 200.
- **Error case:** 401, 403, 404.

### API-014 — Data Referensi Kategori
- **Tujuan:** Mengambil daftar kategori karir referensi.
- **Method / Endpoint:** `GET /categories`
- **Auth:** Tidak
- **Request data:** —
- **Response data:** Daftar kategori (code, display_name, description); status 200.
- **Error case:** 500 (kesalahan server).

### API-015 — Dashboard Agregat (Opsional)
- **Tujuan:** Menyediakan agregat untuk Admin/Internal.
- **Method / Endpoint:** `GET /dashboard/summary`
- **Auth:** Ya (Admin)
- **Request data:** —
- **Response data:** Total CV dianalisis, distribusi kategori, rata-rata confidence; status 200.
- **Error case:** 401, 403.

### API-016 — Health Check
- **Tujuan:** Memeriksa kesehatan layanan.
- **Method / Endpoint:** `GET /health`
- **Auth:** Tidak
- **Request data:** —
- **Response data:** Status kesehatan layanan; status 200.
- **Error case:** 503 (tidak sehat).

> **Konvensi umum API:** menggunakan kata benda jamak untuk resource, nesting yang wajar (`/cvs/:cvId/analyze`), kode status tepat (200/201/204/400/401/403/404/422/429/502/504), serta aturan filtering hasil: `top_5_predictions` hanya `confidence > 0.05`, `career_recommendations` hanya `match_score > 0.3`, dan `matched_skills` terurut menurun berdasarkan `similarity`.


---

## 7. Data Requirements

Bagian ini menjelaskan data utama yang dikelola sistem secara konseptual (apa yang harus disimpan), tanpa masuk ke desain database mendetail. Penomoran menggunakan prefiks **DATA-xxx**.

### DATA-001 — Data Pengguna (User)
- **Deskripsi:** Sistem harus menyimpan identitas pengguna: pengenal unik, email (unik), kredensial dalam bentuk hash, nama lengkap, dan waktu pembuatan.
- **Atribut kunci:** id, email (unik), password_hash, full_name, created_at.
- **Aturan:** Email bersifat unik; password hanya disimpan sebagai hash.

### DATA-002 — Data CV
- **Deskripsi:** Sistem harus menyimpan CV milik pengguna: sumber (teks/berkas), teks mentah, referensi berkas (opsional), pemilik, dan waktu pembuatan.
- **Atribut kunci:** id, user_id (relasi ke User), source_type ('text' | 'file'), raw_text, file_url (opsional), created_at.
- **Aturan:** Sebuah CV selalu terikat pada satu pengguna pemilik.

### DATA-003 — Data Analisis (Analysis)
- **Deskripsi:** Sistem harus menyimpan hasil analisis: status proses, kategori prediksi, confidence, payload hasil lengkap, waktu analisis, serta relasi ke CV dan pengguna.
- **Atribut kunci:** id, cv_id (relasi ke CV), user_id (relasi ke User), status ('pending' | 'success' | 'failed'), predicted_category, confidence, result (payload penuh sesuai API Contract), analyzed_at, created_at.
- **Aturan:** Payload hasil AI disimpan secara fleksibel (mis. JSONB) agar tahan terhadap perubahan struktur model; metadata utama disimpan terpisah untuk kebutuhan tampilan ringkas.

### DATA-004 — Data Referensi Kategori (Category)
- **Deskripsi:** Sistem harus menyimpan data referensi kategori karir.
- **Atribut kunci:** code (mis. 'INFORMATION-TECHNOLOGY'), display_name, description.
- **Aturan:** Kode kategori bersifat unik dan menjadi acuan tampilan kategori pada hasil analisis.

### DATA-005 — Payload Hasil Analisis (sesuai API Contract)
- **Deskripsi:** Payload hasil yang disimpan dan disajikan harus mengikuti struktur API Contract: `predicted_category`, `confidence`, `top_5_predictions[]`, `extracted_skills[]` (matched_skills + similarity, missing_skills), `career_recommendations[]` (match_score), dan `description_career_recommendations`.
- **Aturan filtering data:** `top_5_predictions` ditampilkan hanya bila `confidence > 0.05`; `career_recommendations` hanya bila `match_score > 0.3`; `matched_skills` diurutkan menurun berdasarkan `similarity`.

### DATA-006 — Integritas & Relasi Data
- **Deskripsi:** Sistem harus menjaga integritas relasi antar entitas (User → CV → Analysis) dan mendukung pengambilan data riwayat secara efisien.
- **Aturan:** Penghapusan CV harus konsisten dengan kebijakan data analisis terkait; pengindeksan disediakan pada kolom yang sering di-query (mis. user_id, cv_id, predicted_category) untuk efisiensi.

### DATA-007 — Retensi & Kepemilikan Data
- **Deskripsi:** Data CV dan analisis bersifat milik pengguna; sistem hanya menampilkan data yang dimiliki pengguna yang sedang login.
- **Aturan:** Tidak ada pengguna yang dapat mengakses data pengguna lain melalui endpoint manapun.

---

## 8. Security Requirements

Bagian ini menjelaskan kebutuhan keamanan sistem. Penomoran menggunakan prefiks **SEC-xxx**.

### SEC-001 — Hashing Password
- **Deskripsi:** Sistem harus menyimpan password menggunakan algoritma hashing kuat (mis. bcrypt) dengan salt.
- **Acceptance Criteria:** Password tidak pernah disimpan/ditransmisikan/dikembalikan dalam teks asli.

### SEC-002 — Autentikasi JWT
- **Deskripsi:** Sistem harus menggunakan JWT untuk autentikasi endpoint privat, dengan secret dikelola via environment dan masa berlaku token yang ditentukan.
- **Acceptance Criteria:** Token wajib disertakan pada permintaan privat; permintaan tanpa token valid ditolak (401).

### SEC-003 — Otorisasi Berbasis Kepemilikan
- **Deskripsi:** Sistem harus memastikan pengguna hanya dapat mengakses dan memodifikasi sumber daya miliknya (CV, analisis, biodata).
- **Acceptance Criteria:** Akses ke sumber daya milik pengguna lain ditolak (403).

### SEC-004 — Manajemen Token
- **Deskripsi:** Token harus memiliki masa berlaku, ditangani aman di sisi klien, dan dapat di-invalidate melalui logout (penghapusan sisi klien).
- **Acceptance Criteria:** Token kedaluwarsa ditolak; setelah logout, token lama tidak dapat dipakai mengakses endpoint privat.

### SEC-005 — Validasi & Sanitasi Input
- **Deskripsi:** Seluruh input harus divalidasi dan disanitasi di Backend sebelum diproses/disimpan.
- **Acceptance Criteria:** Input tidak valid ditolak (422); tidak ada eksekusi/penyimpanan data berbahaya.

### SEC-006 — Proteksi terhadap Injeksi
- **Deskripsi:** Sistem harus menggunakan query terparameterisasi/ORM untuk mencegah SQL injection.
- **Acceptance Criteria:** Tidak ada penyusunan query dari penggabungan string input mentah.

### SEC-007 — Kebijakan CORS
- **Deskripsi:** Sistem harus menerapkan kebijakan CORS yang membatasi origin yang diizinkan.
- **Acceptance Criteria:** Permintaan dari origin tidak diizinkan ditolak.

### SEC-008 — Rate Limiting Dasar
- **Deskripsi:** Sistem harus menerapkan rate limiting dasar untuk mencegah penyalahgunaan endpoint (mis. login, analyze).
- **Acceptance Criteria:** Permintaan melebihi ambang dibatasi dengan respons 429.

### SEC-009 — Proteksi Komunikasi
- **Deskripsi:** Komunikasi antar lapisan (FE ↔ BE, BE ↔ AI) harus melalui HTTPS pada lingkungan produksi.
- **Acceptance Criteria:** Endpoint produksi diakses melalui HTTPS.

### SEC-010 — Pengelolaan Rahasia (Secrets)
- **Deskripsi:** Kredensial dan rahasia (secret JWT, kredensial DB, base URL AI) harus dikelola via environment variable, tidak di-hardcode.
- **Acceptance Criteria:** Tidak ada rahasia yang tertulis langsung dalam kode sumber.

### SEC-011 — Isolasi Layanan AI
- **Deskripsi:** Frontend tidak boleh memanggil layanan AI secara langsung; seluruh akses AI melalui Backend.
- **Acceptance Criteria:** Tidak ada panggilan langsung dari Frontend ke layanan AI.

---

## 9. Validation Requirements

Bagian ini menjelaskan aturan validasi input untuk setiap fitur utama. Penomoran menggunakan prefiks **VAL-xxx**. Validasi dilakukan di sisi Frontend (umpan balik cepat) dan ditegakkan kembali di sisi Backend (otoritatif).

### VAL-001 — Validasi Registrasi
- **Aturan:**
  - `full_name`: wajib diisi, panjang minimum yang wajar.
  - `email`: wajib, format email valid, unik.
  - `password`: wajib, memenuhi panjang minimal yang ditetapkan.
  - `konfirmasi password`: wajib, harus sama dengan `password`.
- **Acceptance Criteria:** Pelanggaran aturan menghasilkan pesan validasi spesifik per field dan menolak pembuatan akun.

### VAL-002 — Validasi Login
- **Aturan:** `email` format valid dan wajib; `password` wajib.
- **Acceptance Criteria:** Input tidak lengkap/format salah ditolak sebelum proses autentikasi.

### VAL-003 — Validasi Upload CV (Teks)
- **Aturan:** `raw_text` wajib bila `source_type` = 'text'; memenuhi panjang minimum agar layak dianalisis.
- **Acceptance Criteria:** Teks kosong/terlalu pendek ditolak (422) dengan pesan jelas.

### VAL-004 — Validasi Upload CV (Berkas)
- **Aturan:** Tipe berkas harus termasuk yang didukung (PDF/DOCX); ukuran tidak melebihi batas maksimum yang ditetapkan.
- **Acceptance Criteria:** Tipe tidak didukung atau ukuran berlebih ditolak (422/413) dan disarankan fallback input teks.

### VAL-005 — Validasi Edit Biodata
- **Aturan:** Field yang diubah harus memenuhi format (mis. email valid & unik bila diubah); field wajib tidak boleh dikosongkan.
- **Acceptance Criteria:** Pelanggaran ditolak dengan pesan validasi; email duplikat ditolak (409).

### VAL-006 — Validasi Parameter & Path
- **Aturan:** Parameter path (`cvId`, `analysisId`) harus berformat valid; parameter paginasi (`limit`, `offset`) harus numerik dalam rentang wajar.
- **Acceptance Criteria:** Parameter tidak valid ditolak (400/422).

### VAL-007 — Validasi Respons AI (Schema)
- **Aturan:** Respons dari layanan AI harus divalidasi terhadap schema API Contract sebelum disimpan.
- **Acceptance Criteria:** Respons yang tidak sesuai schema ditolak (422), dicatat ke log, dan analisis ditandai `failed` tanpa membuat sistem crash.

### VAL-008 — Validasi Aturan Filtering Tampilan
- **Aturan:** Sistem menegakkan filter `confidence > 0.05` untuk top predictions dan `match_score > 0.3` untuk rekomendasi karir; `matched_skills` diurutkan menurun berdasarkan similarity.
- **Acceptance Criteria:** Data yang ditampilkan selalu mematuhi aturan filter; bila kosong setelah filter, ditampilkan empty state.


---

## 10. Use Case

Daftar use case utama berdasarkan fitur PRD. Setiap use case memuat ID, Nama, Aktor, Precondition, Main Flow, Alternative Flow, dan Postcondition.

### UC-001 — Registrasi Akun
- **Aktor:** Guest (ACT-01)
- **Precondition:** Pengguna belum memiliki akun dan berada di halaman Register.
- **Main Flow:**
  1. Pengguna mengisi nama, email, password, dan konfirmasi password.
  2. Sistem memvalidasi input.
  3. Sistem membuat akun dan menyimpan password sebagai hash.
  4. Sistem menampilkan konfirmasi sukses dan mengarahkan ke Login.
- **Alternative Flow:**
  - 2a. Validasi gagal → sistem menampilkan pesan kesalahan per field.
  - 3a. Email sudah terdaftar → sistem menolak (409) dengan pesan jelas.
- **Postcondition:** Akun baru tersimpan dan siap digunakan untuk login.

### UC-002 — Login
- **Aktor:** Guest (ACT-01)
- **Precondition:** Pengguna telah memiliki akun.
- **Main Flow:**
  1. Pengguna memasukkan email dan password.
  2. Sistem memvalidasi kredensial.
  3. Sistem menerbitkan JWT dan mengarahkan ke Dashboard.
- **Alternative Flow:**
  - 2a. Kredensial salah → sistem menolak (401) tanpa membocorkan detail.
- **Postcondition:** Pengguna terautentikasi dan memiliki sesi aktif.

### UC-003 — Logout
- **Aktor:** Registered User (ACT-02)
- **Precondition:** Pengguna sedang login.
- **Main Flow:**
  1. Pengguna menekan Logout.
  2. Sistem menghapus token dari klien.
  3. Sistem mengarahkan ke Login.
- **Alternative Flow:** —
- **Postcondition:** Sesi berakhir; endpoint privat tidak lagi dapat diakses dengan token lama.

### UC-004 — Melihat Dashboard Utama
- **Aktor:** Registered User (ACT-02)
- **Precondition:** Pengguna login.
- **Main Flow:**
  1. Pengguna membuka `/dashboard`.
  2. Sistem mengambil data ringkasan analisis terakhir dan riwayat upload.
  3. Sistem menampilkan card ringkasan, CTA Upload CV, dan daftar riwayat.
- **Alternative Flow:**
  - 2a. Belum ada analisis → sistem menampilkan empty state dengan ajakan Upload CV.
- **Postcondition:** Pengguna memperoleh gambaran status terbaru dan jalur menuju aksi berikutnya.

### UC-005 — Mengunggah CV & Memicu Analisis
- **Aktor:** Registered User (ACT-02), AI/ML Service (ACT-04)
- **Precondition:** Pengguna login dan berada di halaman Upload.
- **Main Flow:**
  1. Pengguna menempel teks CV atau mengunggah berkas PDF/DOCX.
  2. Sistem memvalidasi input dan menyimpan CV (memperoleh `cv_id`).
  3. Sistem memicu analisis ke layanan AI.
  4. Sistem menyimpan hasil analisis dan mengarahkan pengguna ke Halaman Analysis.
- **Alternative Flow:**
  - 2a. Validasi gagal (tipe/ukuran/teks) → sistem menolak dengan pesan; sarankan fallback teks.
  - 3a. AI timeout → sistem mengembalikan 504; UI menampilkan opsi coba lagi.
  - 3b. AI error/5xx → sistem mengembalikan 502; UI menampilkan fallback + retry.
  - 3c. Respons AI tidak valid → sistem mengembalikan 422; analisis ditandai `failed`.
- **Postcondition:** CV tersimpan; bila sukses, hasil analisis tersedia dan tervisualisasi.

### UC-006 — Melihat Hasil Analisis
- **Aktor:** Registered User (ACT-02)
- **Precondition:** Terdapat analisis sukses milik pengguna.
- **Main Flow:**
  1. Pengguna membuka Halaman Analysis dari riwayat/dashboard.
  2. Sistem menampilkan bar chart Top 5 predictions (filter confidence > 0.05).
  3. Sistem menampilkan skill gap analysis dari prediksi teratas.
  4. Sistem menampilkan deskripsi rekomendasi karir strategis.
- **Alternative Flow:**
  - 2a. Data kosong setelah filter → sistem menampilkan empty state.
- **Postcondition:** Pengguna memahami kategori prediksi, skill gap, dan rekomendasi.

### UC-007 — Melihat Rekomendasi Karir Lengkap
- **Aktor:** Registered User (ACT-02)
- **Precondition:** Terdapat analisis sukses milik pengguna.
- **Main Flow:**
  1. Pengguna membuka Halaman Rekomendasi Karir dari Halaman Analysis.
  2. Sistem menampilkan seluruh kategori (filter match_score > 0.3).
  3. Pengguna meng-expand kategori untuk melihat skill gap analysis per kategori.
- **Alternative Flow:**
  - 2a. Data kosong setelah filter → sistem menampilkan empty state.
- **Postcondition:** Pengguna memperoleh gambaran lengkap rekomendasi lintas kategori.

### UC-008 — Mengelola Profil & Riwayat
- **Aktor:** Registered User (ACT-02)
- **Precondition:** Pengguna login.
- **Main Flow:**
  1. Pengguna membuka `/profile`.
  2. Sistem menampilkan biodata dan riwayat analisis.
  3. Pengguna mengedit biodata; sistem memvalidasi dan menyimpan perubahan.
  4. Pengguna memilih item riwayat untuk membuka Halaman Analysis.
- **Alternative Flow:**
  - 3a. Validasi gagal/email duplikat → sistem menolak dengan pesan jelas.
- **Postcondition:** Biodata diperbarui; pengguna dapat meninjau analisis sebelumnya.

### UC-009 — Mengelola CV (Lihat/Hapus)
- **Aktor:** Registered User (ACT-02)
- **Precondition:** Pengguna login dan memiliki CV.
- **Main Flow:**
  1. Pengguna melihat daftar CV miliknya.
  2. Pengguna membuka detail atau menghapus CV.
  3. Sistem memperbarui daftar sesuai aksi.
- **Alternative Flow:**
  - 2a. CV bukan milik pengguna → sistem menolak (403/404).
- **Postcondition:** Daftar CV mencerminkan kondisi terkini.

### UC-010 — Melihat Dashboard Agregat (Opsional)
- **Aktor:** Admin/Internal (ACT-03)
- **Precondition:** Admin login dan memiliki hak akses.
- **Main Flow:**
  1. Admin membuka dashboard agregat.
  2. Sistem menampilkan total CV dianalisis, distribusi kategori, dan rata-rata confidence.
- **Alternative Flow:**
  - 1a. Bukan Admin → akses ditolak (403).
- **Postcondition:** Admin memperoleh gambaran agregat sistem.

---

## 11. Acceptance Criteria Global

Sistem dianggap selesai dan layak diuji apabila seluruh kriteria berikut terpenuhi (selaras dengan PRD §14):

1. Pengguna dapat Register & Login (JWT), lalu diarahkan ke Dashboard Utama.
2. Dashboard Utama menampilkan card Ringkasan Analisis Terakhir (kategori prediksi + confidence), CTA Upload CV, dan Riwayat Upload.
3. Pengguna dapat mengunggah CV (minimal teks) pada Halaman Upload dan menerima hasil analisis tervisualisasi.
4. Halaman Analysis menampilkan Top 5 predictions (bar chart, filter > 0.05), skill gap analysis, dan deskripsi rekomendasi karir strategis.
5. Halaman Rekomendasi Karir menampilkan seluruh kategori (filter match_score > 0.3) beserta skill gap per kategori.
6. Halaman Profile menampilkan biodata (lihat/edit) dan riwayat analysis CV.
7. Frontend dibangun & di-bundle dengan Vite, styling Tailwind, networking via Axios.
8. Backend Express menyediakan RESTful API berkonvensi dan menyimpan data ke PostgreSQL.
9. Fitur utama (analisis AI) terintegrasi dan tidak crash saat AI gagal/timeout (resilient dengan fallback + retry).
10. Layout responsif di mobile, tablet, dan desktop.
11. Aplikasi ter-deploy (Frontend di Vercel, Backend + PostgreSQL di server).
12. Mockup UI tersedia untuk seluruh halaman.
13. Kode lulus lint & build (`vite build`, `tsc`); API terdokumentasi dan teruji manual.
14. Error handling & loading state tersedia untuk seluruh pemanggilan AI.
15. Tersedia README cara menjalankan FE & BE lokal beserta variabel environment, dan URL deployment dapat diakses publik.

---

## 12. Traceability Matrix

Tabel berikut memetakan fitur pada PRD ke kebutuhan SRS yang relevan, sehingga setiap fitur produk dapat ditelusuri ke spesifikasi sistemnya.

| Fitur PRD | Deskripsi Singkat | Functional (FR) | UI | API | Data | Security / Validation | Use Case |
|---|---|---|---|---|---|---|---|
| **F1** Autentikasi & Sesi | Register, Login, Logout, proteksi halaman privat | FR-001, FR-002, FR-003, FR-004 | UI-003, UI-004, UI-005 | API-001, API-002 | DATA-001 | SEC-001, SEC-002, SEC-004, VAL-001, VAL-002 | UC-001, UC-002, UC-003 |
| **F2** Dashboard Utama | Ringkasan analisis terakhir, CTA upload, riwayat | FR-005, FR-006, FR-007 | UI-008, UI-013 | API-005, API-012 | DATA-003 | VAL-006 | UC-004 |
| **F3** Upload & Manajemen CV | Upload teks/berkas, validasi, daftar, hapus | FR-008, FR-009, FR-010, FR-011, FR-012 | UI-006, UI-012, UI-014 | API-006, API-007, API-008, API-009 | DATA-002 | SEC-003, VAL-003, VAL-004 | UC-005, UC-009 |
| **F4** Analisis CV via AI/ML | Orkestrasi AI, resiliensi, penyimpanan, mock | FR-013, FR-014, FR-015 | UI-012, UI-014 | API-010, API-011 | DATA-003, DATA-005 | SEC-011, VAL-007, NFR-009, NFR-020 | UC-005 |
| **F5** Halaman Analysis | Top 5 predictions, skill gap, deskripsi karir | FR-016, FR-017, FR-018, FR-019 | UI-009, UI-013 | API-013 | DATA-005 | VAL-008 | UC-006 |
| **F6** Rekomendasi Karir | Seluruh kategori + skill gap per kategori | FR-020, FR-021 | UI-010, UI-013 | API-013 | DATA-005 | VAL-008 | UC-007 |
| **F7** Profile | Biodata (lihat/edit) + riwayat analisis | FR-022, FR-023 | UI-007, UI-011 | API-003, API-004, API-012 | DATA-001, DATA-003 | SEC-003, VAL-005 | UC-008 |
| **F8** Dashboard Agregat (Opsional) | Statistik agregat admin | FR-024 | — | API-015 | DATA-003 | SEC-003 | UC-010 |
| **Referensi & Ops** | Kategori, health check | FR-025, FR-026 | — | API-014, API-016 | DATA-004 | NFR-022 | — |
| **BR-1..BR-11** | Kriteria proyek (Vite, Axios, Express, Postgres, REST, AI, resilient, mockup, responsif, deploy, Tailwind) | FR-013 (resilient) | UI-001, UI-002, UI-015 | API-001..API-016 | DATA-001..DATA-006 | NFR-001, NFR-009, NFR-013, NFR-021 | Seluruh UC |

---

### Lampiran — Catatan Penutup

Dokumen SRS ini diturunkan langsung dari PRD Path`Ora v1.2 dan mempertahankan tujuan utama produk: mengubah CV menjadi insight kesiapan kerja yang actionable serta memberikan rekomendasi jalur karir yang relevan. Spesifikasi ini fokus pada "apa yang harus dilakukan sistem" dan sengaja tidak menetapkan detail implementasi teknis (struktur folder, skema fisik database, atau kode program), sesuai ketentuan penyusunan. Setiap perubahan pada PRD perlu direfleksikan kembali ke dokumen ini melalui mekanisme versioning untuk menjaga konsistensi traceability.
