# Path'Ora Frontend - API Integration Implementation Guide

**Tanggal**: 3 Juni 2026  
**Status**: Complete - Ready for Backend Integration  
**Versi**: 1.0

---

## 📋 Daftar Isi

1. [Ringkasan Implementasi](#ringkasan-implementasi)
2. [Struktur File & Folder](#struktur-file--folder)
3. [Components, Hooks & Services](#components-hooks--services)
4. [API Integration](#api-integration)
5. [Type Definitions](#type-definitions)
6. [Error Handling](#error-handling)
7. [Validation](#validation)
8. [State Management](#state-management)
9. [Utility Functions](#utility-functions)
10. [Environment Configuration](#environment-configuration)
11. [Testing Checklist](#testing-checklist)
12. [Backend Integration Steps](#backend-integration-steps)

---

## 🎯 Ringkasan Implementasi

Frontend Path'Ora telah dilengkapi dengan:

✅ **Types & Interfaces** - Lengkap untuk semua API contracts  
✅ **Services Layer** - 7 services untuk API calls  
✅ **Hooks** - 7 custom hooks untuk data fetching & state management  
✅ **Global State** - Zustand stores untuk auth & UI  
✅ **Validation** - Zod schemas untuk form validation  
✅ **Error Handling** - Centralized error parsing & user-friendly messages  
✅ **Utility Functions** - Format, filter, sort, validation helpers  
✅ **API Client** - Axios instance dengan JWT interceptor  
✅ **Constants** - API routes & env config  

---

## 📁 Struktur File & Folder

```
src/
├── types/
│   ├── index.ts                 ✅ Central exports
│   ├── api.ts                   ✅ API response types
│   ├── auth.ts                  ✅ Auth types
│   ├── cv.ts                    ✅ CV types
│   ├── analysis.ts              ✅ Analysis types
│   ├── category.ts              ✅ Category types
│   └── dashboard.ts             ✅ Dashboard types
│
├── services/
│   ├── api.client.ts            ✅ Axios instance + interceptors
│   ├── auth.service.ts          ✅ Auth API calls
│   ├── cv.service.ts            ✅ CV upload & management
│   ├── analysis.service.ts      ✅ Analysis fetch
│   ├── user.service.ts          ✅ User profile
│   ├── category.service.ts      ✅ Category fetch
│   └── dashboard.service.ts     ✅ Dashboard summary
│
├── hooks/
│   ├── useAuth.ts               ✅ Auth logic
│   ├── useCVUpload.ts           ✅ CV upload with progress
│   ├── useAnalysis.ts           ✅ Analysis fetch & analyze
│   ├── useCareerRecs.ts         ✅ Career recommendations
│   ├── useDashboard.ts          ✅ Dashboard data
│   ├── useProfile.ts            ✅ Profile & history
│   └── useCategories.ts         ✅ Categories fetch
│
├── store/
│   ├── auth.store.ts            ✅ Auth state (Zustand)
│   └── ui.store.ts              ✅ UI state (toast, modal, loading)
│
├── utils/
│   ├── error.ts                 ✅ Error parsing & helpers
│   ├── validation.ts            ✅ Zod schemas & validators
│   ├── format.ts                ✅ Date, number formatting
│   ├── filter.ts                ✅ Data filtering helpers
│   └── sort.ts                  ✅ Data sorting helpers
│
├── constants/
│   ├── environment.ts           ✅ ENV config
│   └── api-routes.ts            ✅ API endpoint constants
│
└── pages/
    ├── Auth/
    │   ├── LoginPage.tsx
    │   └── RegisterPage.tsx
    ├── Dashboard/
    │   └── DashboardPage.tsx
    ├── Upload/
    │   └── UploadPage.tsx
    ├── Analysis/
    │   └── AnalysisPage.tsx
    ├── CareerRecommendations/
    │   └── CareerRecommendationsPage.tsx
    └── Profile/
        └── ProfilePage.tsx
```

---

## 🔧 Components, Hooks & Services

### Services Layer

**auth.service.ts** - Authentication  
- `register(payload)` → POST /auth/register
- `login(payload)` → POST /auth/login
- `logout()` → Clear token
- `getCurrentUser()` → GET /users/me
- `updateProfile(payload)` → PATCH /users/me

**cv.service.ts** - CV Management  
- `uploadCV(payload)` → POST /cvs (text atau file)
- `getCV(cvId)` → GET /cvs/:id
- `analyzeCV(cvId)` → POST /cvs/:id/analyze
- `getCVList(page, limit)` → GET /cvs?page=1&limit=10

**analysis.service.ts** - Analysis Results  
- `getAnalysis(analysisId)` → GET /analyses/:id
- `getAnalyses(page, limit)` → GET /analyses?page=1&limit=10
- `getAnalysisHistory(limit)` → GET /analyses?limit=5

**user.service.ts** - User Profile  
- `getProfile()` → GET /users/me
- `updateProfile(payload)` → PATCH /users/me

**category.service.ts** - Categories  
- `getCategories()` → GET /categories

**dashboard.service.ts** - Dashboard  
- `getDashboardSummary()` → GET /dashboard/summary
- `getAnalysisHistory(limit)` → GET /dashboard/analysis-history

### Hooks Layer

**useAuth()** - Authentication logic  
```tsx
const { login, register, logout, clearError, isSubmitting, error, user, isAuthenticated } = useAuth();
```

**useCVUpload()** - CV upload with progress  
```tsx
const { uploadCV, isLoading, progress, error, success, cvId, resetState } = useCVUpload();
```

**useAnalysis(analysisId?)** - Analysis fetch & analyze  
```tsx
const { analysis, analyzeCV, isLoading, isAnalyzing, error } = useAnalysis(analysisId);
```

**useDashboard()** - Dashboard data  
```tsx
const { summary, history, isLoading, error, refresh } = useDashboard();
```

**useCareerRecs(analysisId?)** - Career recommendations  
```tsx
const { analysis, isLoading, error } = useCareerRecs(analysisId);
```

**useProfile()** - Profile & history  
```tsx
const { user, analyses, updateProfile, refresh, isLoadingUser, isUpdating, error } = useProfile();
```

**useCategories()** - Categories  
```tsx
const { categories, isLoading, error } = useCategories();
```

---

## 🌐 API Integration

### Base Configuration

Endpoint: `${ENV.API_BASE_URL}` (default: `http://localhost:3000/api/v1`)

### Authentication

- **Method**: JWT Token
- **Header**: `Authorization: Bearer {token}`
- **Storage**: `localStorage.setItem('token', token)`
- **Interceptor**: Otomatis di-attach di setiap request

### Error Handling

**Status Code Handling:**
- `400` - Invalid input
- `401` - Unauthorized (redirect ke login)
- `404` - Not found
- `422` - Validation error
- `500` - Server error
- `502` - AI service unavailable
- `504` - Timeout

**Error Response Format (sesuai SRS):**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "fields": {
      "email": "Email sudah terdaftar"
    }
  }
}
```

### API Response Contract

```json
{
  "data": { /* actual data */ },
  "error": null,
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

## 📝 Type Definitions

### Core Types

**User**
```ts
interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at?: string;
}
```

**CV**
```ts
interface CV {
  id: string;
  user_id: string;
  source_type: "text" | "file";
  raw_text: string;
  file_url?: string;
  created_at: string;
}
```

**Analysis Result** (dari AI/ML service)
```ts
interface AnalysisResult {
  predicted_category: string;        // e.g., "INFORMATION-TECHNOLOGY"
  confidence: number;                // 0-1
  top_predictions: TopPrediction[];  // Top 5
  career_recommendations: CareerRecommendation[];
  description_career_recommendations: string;
  matched_skills: string[];
  missing_skills: string[];
}

interface TopPrediction {
  category: string;
  score: number;
  confidence: number;
  matched_skills: string[];
  missing_skills: string[];
}

interface CareerRecommendation {
  category: string;
  match_score: number;  // 0-1
  description?: string;
  matched_skills: string[];
  missing_skills: string[];
}
```

---

## 🚨 Error Handling

### Global Error Parser

```ts
import { parseApiError } from "@/utils/error";

try {
  const result = await someApiCall();
} catch (error) {
  const message = parseApiError(error);
  console.error(message); // User-friendly message
}
```

### Error Utility Functions

```ts
// Check error types
isNetworkError(error)      // Koneksi gagal
isUnauthorizedError(error) // 401 - perlu login ulang
isTimeoutError(error)      // ECONNABORTED
isValidationError(error)   // 422 - field validation

// Extract error details
getErrorCode(error)        // Untuk logging
getFieldErrors(error)      // Field-level errors dari 422
```

---

## ✅ Validation

### Zod Schemas

```ts
import { loginSchema, registerSchema, cvUploadSchema } from "@/utils/validation";

// Login
const loginData = loginSchema.parse(formData);

// Register
const registerData = registerSchema.parse(formData);

// CV Upload
const cvData = cvUploadSchema.parse(formData);

// Async validation with error handling
const { success, data, errors } = await validateFormData(loginSchema, formData);
if (!success) {
  // Handle field errors
  console.log(errors); // { email: "Invalid email", password: "Required" }
}
```

### Validation Rules

- Email: RFC 5322 format
- Password: Minimal 6 karakter
- Name: 3-100 karakter
- CV text: Minimal 50 karakter
- CV file: PDF/DOCX, maksimal 5MB

---

## 🎛️ State Management

### Global Auth State (Zustand)

```tsx
import { useAuthStore } from "@/store/auth.store";

const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();
```

### Global UI State (Zustand)

```tsx
import { useUIStore } from "@/store/ui.store";

const { 
  toasts, addToast, removeToast,
  isLoading, setLoading,
  modals, openModal, closeModal,
  error, setError, clearError
} = useUIStore();

// Add success toast
useUIStore.getState().addToast({
  type: "success",
  message: "CV berhasil dianalisis!",
  duration: 3000
});

// Add error toast  
useUIStore.getState().addToast({
  type: "error",
  message: "Gagal mengunggah CV",
  duration: 5000
});
```

---

## 🛠️ Utility Functions

### Formatting

```ts
import { 
  formatDate,           // "2024-01-15" → "15 Januari 2024"
  formatDateShort,      // "2024-01-15" → "15 Jan 2024"
  formatRelativeTime,   // "3 jam yang lalu"
  formatPercentage,     // 0.85 → "85%"
  formatConfidenceScore,// 0.92 → "92%"
  formatCategoryName,   // "INFORMATION-TECHNOLOGY" → "Information Technology"
  truncateString        // Potong string dengan ellipsis
} from "@/utils/format";
```

### Filtering

```ts
import {
  filterTopPredictions,        // confidence > 0.05
  filterCareerRecommendations, // match_score > 0.3
  getTopNPredictions,
  filterAnalysesByStatus,
  searchSkills,
  deduplicateSkills
} from "@/utils/filter";
```

### Sorting

```ts
import {
  sortPredictionsByConfidence,
  sortRecommendationsByScore,
  sortAnalysesByDate,      // newest first
  sortSkillsAlphabetically
} from "@/utils/sort";
```

---

## ⚙️ Environment Configuration

**File**: `src/constants/environment.ts`

```ts
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  AI_TIMEOUT_MS: Number(import.meta.env.VITE_AI_TIMEOUT_MS ?? 35000),
} as const;
```

**Setup Environment Variables** (`.env.local`):

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_AI_TIMEOUT_MS=35000

# Optional: For production
# VITE_API_BASE_URL=https://api.pathora.com/api/v1
```

---

## 🧪 Testing Checklist

### Manual Testing Steps

#### Auth Flow
- [ ] Register dengan email & password baru
- [ ] Login dengan email & password
- [ ] Logout dan redirect ke login
- [ ] Token tersimpan di localStorage
- [ ] Protected routes redirect ke login jika tidak auth

#### CV Upload
- [ ] Upload CV teks (minimal 50 karakter)
- [ ] Upload file PDF
- [ ] Upload file DOCX
- [ ] Validasi file size (max 5MB)
- [ ] Progress bar tampil saat upload
- [ ] Error message jika upload gagal
- [ ] Redirect ke Analysis page saat analisis selesai

#### Analysis
- [ ] Fetch analysis result
- [ ] Top 5 predictions tampil dengan filter confidence > 0.05
- [ ] Skill gap analysis tampil dengan matched & missing skills
- [ ] Recommendation text tampil
- [ ] Loading skeleton saat fetch

#### Dashboard
- [ ] Latest analysis tampil di card
- [ ] Analysis history tampil (limit 5)
- [ ] Empty state jika belum ada CV
- [ ] Refresh button bekerja
- [ ] Pagination bekerja (jika ada)

#### Profile
- [ ] User biodata tampil
- [ ] Edit profile bekerja
- [ ] Analysis history tampil lengkap
- [ ] Click item history → ke Analysis page

#### Error Cases
- [ ] Network error → user-friendly message
- [ ] 401 → redirect ke login
- [ ] 422 → tampilkan field errors
- [ ] 502 (AI down) → graceful fallback, tidak crash
- [ ] 504 (timeout) → retry button
- [ ] Retry mechanism bekerja

---

## 🚀 Backend Integration Steps

### 1. Backend API Setup

Backend harus menyediakan endpoints sesuai API_ROUTES:

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/me
PATCH  /api/v1/users/me

POST   /api/v1/cvs
GET    /api/v1/cvs/:id
POST   /api/v1/cvs/:id/analyze
GET    /api/v1/cvs?page=1&limit=10

GET    /api/v1/analyses/:id
GET    /api/v1/analyses?page=1&limit=10

GET    /api/v1/categories

GET    /api/v1/dashboard/summary
GET    /api/v1/dashboard/analysis-history

GET    /api/v1/health
```

### 2. Response Format

Backend harus return response sesuai contract:

```json
{
  "data": { /* actual data */ },
  "error": null,
  "meta": { "page": 1, "limit": 10, "total": 100 }
}
```

Error:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "fields": { "email": "Already registered" }
  }
}
```

### 3. Update Environment

Update `.env.local` dengan URL backend:

```env
VITE_API_BASE_URL=http://backend-url:3000/api/v1
```

### 4. CORS Configuration

Backend harus configure CORS untuk frontend URL:

```
Access-Control-Allow-Origin: http://localhost:5173 (dev)
Access-Control-Allow-Origin: https://pathora.vercel.app (prod)
```

### 5. JWT Setup

- Return JWT di login/register response
- Frontend otomatis attach token di Authorization header
- Backend validate JWT pada setiap protected endpoint
- Return 401 jika token invalid/expired

### 6. AI Service Integration

Backend harus:
- Call AI service dengan CV text
- Transform response sesuai AnalysisResult contract
- Handle AI timeout (return 504)
- Handle AI error (return 502)
- Save result ke database dengan JSONB

### 7. Testing with Mock Data

Sebelum AI service ready, backend bisa return mock response:

```ts
// Mock response sesuai AnalysisResult contract
const mockAnalysis: AnalysisResult = {
  predicted_category: "INFORMATION-TECHNOLOGY",
  confidence: 0.92,
  top_predictions: [
    {
      category: "INFORMATION-TECHNOLOGY",
      score: 0.92,
      confidence: 0.92,
      matched_skills: ["JavaScript", "React", "Node.js"],
      missing_skills: ["System Design", "DevOps"]
    }
  ],
  career_recommendations: [ /* ... */ ],
  description_career_recommendations: "Based on your CV...",
  matched_skills: ["JavaScript", "React", "Node.js"],
  missing_skills: ["System Design", "DevOps"]
};
```

---

## 📊 API Contract Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/register` | POST | ❌ | Register user |
| `/auth/login` | POST | ❌ | Login user |
| `/users/me` | GET | ✅ | Get current user |
| `/users/me` | PATCH | ✅ | Update profile |
| `/cvs` | POST | ✅ | Upload CV |
| `/cvs/:id` | GET | ✅ | Get CV |
| `/cvs/:id/analyze` | POST | ✅ | Trigger analysis |
| `/cvs` | GET | ✅ | List CVs |
| `/analyses/:id` | GET | ✅ | Get analysis result |
| `/analyses` | GET | ✅ | List analyses |
| `/categories` | GET | ✅ | Get categories |
| `/dashboard/summary` | GET | ✅ | Dashboard summary |
| `/dashboard/analysis-history` | GET | ✅ | Analysis history |
| `/health` | GET | ❌ | Health check |

---

## 🎓 Usage Examples

### Login

```tsx
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const { login, isSubmitting, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
    // useAuth handles redirect
  };

  return (
    // Form component
  );
}
```

### Upload CV

```tsx
import { useCVUpload } from "@/hooks/useCVUpload";

export function UploadPage() {
  const { uploadCV, isLoading, progress, error, success } = useCVUpload();

  const handleUpload = async (text: string) => {
    const result = await uploadCV({
      source_type: "text",
      raw_text: text,
    });
    
    if (result) {
      // Analyze CV
      const analysis = await analyzeCV(result.id);
      // Redirect to analysis page
    }
  };

  return (
    // Form with progress bar
  );
}
```

### Fetch Analysis

```tsx
import { useAnalysis } from "@/hooks/useAnalysis";
import { filterTopPredictions, getTopNPredictions } from "@/utils/filter";

export function AnalysisPage({ analysisId }: { analysisId: string }) {
  const { analysis, isLoading, error } = useAnalysis(analysisId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error} />;
  if (!analysis?.result) return <EmptyState />;

  const topPredictions = getTopNPredictions(
    filterTopPredictions(analysis.result.top_predictions, 0.05),
    5
  );

  return (
    // Render analysis with filtered predictions
  );
}
```

---

## 📞 Support & Documentation

- **PRD**: `docs/PRD-Full-Stack-Development.md`
- **SDD**: `docs/SDD-Frontend-Software-Design-Document.md`
- **SRS**: `docs/SRS-Software-Requirements-Specification.md`

---

**Status**: ✅ Ready for Backend Integration  
**Last Updated**: 3 Juni 2026  
**Version**: 1.0
