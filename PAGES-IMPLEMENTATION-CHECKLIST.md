# 🔧 Pages Implementation Checklist

**Status**: Integration points identified  
**Estimated Time**: 2-3 hours untuk update semua pages

---

## 📋 Checklist Update Pages

Berikut adalah checklist untuk mengupdate setiap page agar menggunakan hooks & services yang baru dibuat.

---

## 1. LoginPage (auth/login)

**File**: `src/pages/Auth/LoginPage.tsx`

### Current State
- Render form dengan email & password

### TODO
- [ ] Import `useAuth` hook
- [ ] Import `loginSchema` dari utils/validation
- [ ] Import `useUIStore` untuk toast
- [ ] Import `Button`, `Input` components
- [ ] Implement form handling:
  ```tsx
  const { login, isSubmitting, error, clearError } = useAuth();
  const { addToast } = useUIStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const { success, data, errors } = await validateFormData(
      loginSchema,
      { email, password }
    );
    
    if (!success) {
      // Show field errors
      return;
    }
    
    await login(data);
  };
  ```
- [ ] Show error messages (dari hook & field validation)
- [ ] Add loading state ke button
- [ ] Add link ke register page
- [ ] Test: successful login → redirect to /dashboard

---

## 2. RegisterPage (auth/register)

**File**: `src/pages/Auth/RegisterPage.tsx`

### Current State
- Render form dengan name, email, password

### TODO
- [ ] Import `useAuth` hook
- [ ] Import `registerSchema` dari utils/validation
- [ ] Import `useUIStore` untuk toast
- [ ] Implement form handling:
  ```tsx
  const { register, isSubmitting, error, clearError } = useAuth();
  const { addToast } = useUIStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const { success, data, errors } = await validateFormData(
      registerSchema,
      { name, email, password, password_confirm }
    );
    
    if (!success) {
      // Show field errors
      return;
    }
    
    await register(data);
  };
  ```
- [ ] Show password validation feedback
- [ ] Add link ke login page
- [ ] Test: successful register → redirect to /dashboard

---

## 3. DashboardPage (/dashboard)

**File**: `src/pages/Dashboard/DashboardPage.tsx`

### Current State
- Render score card, upload CTA, history

### TODO
- [ ] Import `useDashboard` hook
- [ ] Import `useAuthStore` untuk user data
- [ ] Import formatting utilities
- [ ] Implement data fetching:
  ```tsx
  const { summary, history, isLoading, refresh } = useDashboard();
  const { user } = useAuthStore();
  
  useEffect(() => {
    // Auto-refresh setiap 30 detik (opsional)
  }, []);
  ```
- [ ] Display latest analysis:
  ```tsx
  {summary?.latest_analysis ? (
    <Card>
      <div className="flex items-center justify-between">
        <h3>{summary.latest_analysis.predicted_category}</h3>
        <Score>{formatPercentage(summary.latest_analysis.confidence)}</Score>
      </div>
    </Card>
  ) : (
    <EmptyState message="Belum ada analisis" />
  )}
  ```
- [ ] Display analysis history:
  ```tsx
  {history.map((item) => (
    <AnalysisHistoryItem
      key={item.id}
      date={formatDate(item.created_at)}
      category={formatCategoryName(item.predicted_category)}
      score={formatPercentage(item.confidence)}
      onClick={() => navigate(`/analysis/${item.id}`)}
    />
  ))}
  ```
- [ ] Add button to upload: `onClick={() => navigate('/upload')}`
- [ ] Show loading skeleton while fetching
- [ ] Add refresh button dengan loading state
- [ ] Test: data loads, history clickable, upload button works

---

## 4. UploadPage (/upload)

**File**: `src/pages/Upload/UploadPage.tsx`

### Current State
- Render file dropzone, text input, analyze button

### TODO
- [ ] Import `useCVUpload` hook
- [ ] Import `cvUploadSchema` dari utils/validation
- [ ] Import `useUIStore` untuk toast
- [ ] Import `useNavigate` dari router
- [ ] Implement upload handling:
  ```tsx
  const { uploadCV, isLoading, progress, error, success, cvId } = useCVUpload();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  
  const handleUpload = async (text: string | File) => {
    const sourceType = text instanceof File ? "file" : "text";
    
    const result = await uploadCV({
      source_type: sourceType,
      raw_text: sourceType === "text" ? text : undefined,
      file: sourceType === "file" ? text : undefined,
    });
    
    if (result) {
      addToast({
        type: "success",
        message: "CV berhasil diupload! Sedang dianalisis...",
      });
      
      // Trigger analyze
      const analysis = await analyzeCV(result.id);
      
      if (analysis?.id) {
        navigate(`/analysis/${analysis.id}`);
      }
    }
  };
  ```
- [ ] Show progress bar: `<ProgressBar value={progress} />`
- [ ] Show error message jika ada
- [ ] Disable button saat uploading
- [ ] Support both text & file upload
- [ ] Validate file size & type (client-side)
- [ ] Test: text upload, file upload, progress, error handling

---

## 5. AnalysisPage (/analysis/:id)

**File**: `src/pages/Analysis/AnalysisPage.tsx`

### Current State
- Show dummy chart, skill gap, recommendations

### TODO
- [ ] Import `useAnalysis` hook dengan param: `useAnalysis(analysisId)`
- [ ] Import `useCareerRecs` (optional, jika gunakan di page ini)
- [ ] Import utilities:
  ```tsx
  import { filterTopPredictions, getTopNPredictions } from "@/utils/filter";
  import { formatPercentage, formatCategoryName } from "@/utils/format";
  ```
- [ ] Implement data fetching:
  ```tsx
  const { id } = useParams();
  const { analysis, isLoading, error } = useAnalysis(id);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error} />;
  if (!analysis?.result) return <EmptyState />;
  
  const topPredictions = getTopNPredictions(
    filterTopPredictions(analysis.result.top_predictions, 0.05),
    5
  );
  ```
- [ ] Update chart data dengan real data:
  ```tsx
  <TopPredictionsChart
    data={topPredictions.map(p => ({
      category: formatCategoryName(p.category),
      confidence: formatPercentage(p.confidence),
      score: p.score,
    }))}
  />
  ```
- [ ] Update skill gap dari top prediction:
  ```tsx
  const topPrediction = topPredictions[0];
  
  <MatchedSkillList skills={topPrediction?.matched_skills || []} />
  <MissingSkillList skills={topPrediction?.missing_skills || []} />
  ```
- [ ] Update recommendation text:
  ```tsx
  <RecommendationSection>
    {analysis.result.description_career_recommendations}
  </RecommendationSection>
  ```
- [ ] Add button ke career recommendations:
  ```tsx
  <Button onClick={() => navigate(`/career-recommendations/${id}`)}>
    LIHAT REKOMENDASI KARIR LENGKAP
  </Button>
  ```
- [ ] Test: data loads, chart renders, skills display, navigation works

---

## 6. CareerRecommendationsPage (/career-recommendations/:id)

**File**: `src/pages/CareerRecommendations/CareerRecommendationsPage.tsx`

### Current State
- Show list of job recommendations

### TODO
- [ ] Import `useCareerRecs` hook
- [ ] Import filtering utilities
- [ ] Implement data fetching:
  ```tsx
  const { id } = useParams();
  const { analysis, isLoading, error } = useCareerRecs(id);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  
  const recommendations = filterCareerRecommendations(
    analysis?.result?.career_recommendations || [],
    0.3
  );
  ```
- [ ] Update recommendations list:
  ```tsx
  {recommendations.map((rec) => (
    <JobRecommendationCard
      key={rec.category}
      job={{
        id: rec.category,
        title: formatCategoryName(rec.category),
        category: rec.category,
        matchPercentage: Math.round(rec.match_score * 100),
        matchingSkills: rec.matched_skills,
        missingSkills: rec.missing_skills,
      }}
    />
  ))}
  ```
- [ ] Add button kembali ke analysis
- [ ] Test: all recommendations display, filtering works

---

## 7. ProfilePage (/profile)

**File**: `src/pages/Profile/ProfilePage.tsx`

### Current State
- Show user bio, edit form, analysis history

### TODO
- [ ] Import `useProfile` hook
- [ ] Import `useAuthStore`
- [ ] Import formatting utilities
- [ ] Implement data fetching:
  ```tsx
  const { user, analyses, updateProfile, isLoadingUser, isUpdating, error } = useProfile();
  
  const handleSaveProfile = async (name, email) => {
    const updated = await updateProfile({ name, email });
    
    if (updated) {
      addToast({
        type: "success",
        message: "Profil berhasil diupdate",
      });
    }
  };
  ```
- [ ] Display user bio:
  ```tsx
  <div>
    <h2>{user?.name}</h2>
    <p>{user?.email}</p>
  </div>
  ```
- [ ] Show edit form dengan loading state
- [ ] Display analysis history dengan pagination:
  ```tsx
  {analyses.map((analysis) => (
    <AnalysisHistoryItem
      key={analysis.id}
      date={formatDate(analysis.created_at)}
      category={formatCategoryName(analysis.predicted_category)}
      score={formatPercentage(analysis.confidence)}
      onClick={() => navigate(`/analysis/${analysis.id}`)}
    />
  ))}
  ```
- [ ] Add pagination controls jika > 10 items
- [ ] Test: load profile, edit profile, show history

---

## 🎯 Implementation Order

Recommended order untuk implementasi:

1. **LoginPage & RegisterPage** - Karena harus siap dulu sebelum testing page lain
2. **DashboardPage** - Main landing page setelah login
3. **UploadPage** - Core feature untuk upload CV
4. **AnalysisPage** - Display hasil analysis
5. **CareerRecommendationsPage** - Detailed recommendations
6. **ProfilePage** - User profile management

---

## 📝 Common Patterns

### Loading State
```tsx
if (isLoading) return <Skeleton />;
if (!data) return <EmptyState />;
```

### Error Handling
```tsx
if (error) return <ErrorState message={error} retry={retry} />;
```

### Success Toast
```tsx
const { addToast } = useUIStore();
addToast({
  type: "success",
  message: "Operasi berhasil!",
  duration: 3000,
});
```

### Navigation
```tsx
const navigate = useNavigate();
navigate(`/analysis/${analysisId}`);
```

### Form Validation
```tsx
const { success, data, errors } = await validateFormData(schema, formData);
if (!success) {
  // Show errors
  return;
}
// Use data
```

---

## ✅ Testing After Implementation

Untuk setiap page, test:

- [ ] **Loading state** - Skeleton tampil saat fetch
- [ ] **Success state** - Data tampil dengan benar
- [ ] **Error state** - Error message tampil
- [ ] **Empty state** - Tampil jika tidak ada data
- [ ] **Loading spinner** - Saat submit/fetch
- [ ] **Error message** - User-friendly message
- [ ] **Navigation** - Link & button bekerja
- [ ] **Redirect** - Auth check & redirect bekerja
- [ ] **Form validation** - Client-side validation works
- [ ] **Data refresh** - Manual refresh button bekerja

---

## 🚀 Next Steps

1. Follow checklist di atas untuk setiap page
2. Test masing-masing page secara individual
3. Test end-to-end flow: Register → Login → Upload → Analysis → Profile
4. Integration test dengan backend saat ready
5. User acceptance testing

---

**Status**: Ready to implement  
**Estimated Duration**: 2-3 hours  
**Difficulty**: Easy-Medium (copy-paste dengan adaptation)
