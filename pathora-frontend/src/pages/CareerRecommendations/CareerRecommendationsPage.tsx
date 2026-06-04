import React from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import JobRecommendationCard from "./Job";
import { useCareerRecs } from "../../hooks/useCareerRecs";

const CareerRecommendationsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { analysis, isLoading, error } = useCareerRecs(analysisId);
  const recommendations = analysis?.result?.career_recommendations ?? [];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F4F9F4] px-10 pt-0 pb-8 font-['Newsreader']">
        <div className="max-w-7xl mx-auto">
          <div className="mb-7">
            <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
              Rekomendasi Karir
            </h1>
            <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
              Berdasarkan hasil analisis CV dan keterampilan Anda, berikut
              rekomendasi karir dengan tingkat kecocokan tertinggi.
            </p>
          </div>

          {isLoading && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-600">
              Memuat rekomendasi karir...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
              {error}
            </div>
          )}

          {!isLoading && !error && analysis && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-[#102619]">
                Hasil Analisis Utama
              </h2>

              <div className="mt-4 flex flex-col gap-2">
                <div>
                  <span className="text-gray-500 text-sm">
                    Kategori Karir
                  </span>
                  <p className="text-lg font-medium text-[#102619]">
                    {analysis.predicted_category}
                  </p>
                </div>

                <div>
                  <span className="text-gray-500 text-sm">
                    Confidence Score
                  </span>
                  <p className="text-lg font-medium text-[#A27A53]">
                    {(analysis.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-6">
              {recommendations.length > 0 ? (
                recommendations.map((career, index) => (
                  <JobRecommendationCard
                    key={`${career.category}-${index}`}
                    job={{
                      id: index,
                      title: career.category,
                      category: career.description || career.category,
                      matchPercentage: Math.round(career.match_score * 100),
                      matchingSkills: career.matched_skills ?? [],
                      missingSkills: career.missing_skills ?? [],
                    }}
                  />
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-500">
                  Tidak ada rekomendasi karir tersedia.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CareerRecommendationsPage;
