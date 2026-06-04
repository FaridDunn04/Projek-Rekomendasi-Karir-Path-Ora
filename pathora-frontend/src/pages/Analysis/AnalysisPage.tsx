import React from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { Plane, SlidersHorizontal, Sparkles } from "lucide-react";
import { useAnalysis } from "../../hooks/useAnalysis";

const AnalysisPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { analysis, isLoading, error } = useAnalysis(analysisId);
  const result = analysis?.result;
  const topPredictions = result?.top_predictions ?? [];
  const matchedSkills = result?.matched_skills ?? [];
  const missingSkills = result?.missing_skills ?? [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen text-gray-600">
          Memuat hasil analisis...
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen text-red-600">
          {error}
        </div>
      </AppLayout>
    );
  }

  if (!analysis || !result) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen text-gray-600">
          Data analisis tidak ditemukan.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F7F6F2] px-10 pt-0 pb-8 font-['Newsreader']">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-5">
            <div className="mb-7">
              <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
                Hasil Analisis CV
              </h1>
              <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
                Berikut hasil analisis CV berdasarkan data CV terakhir Anda.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 min-w-[190px]">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#102619]">
                  {Math.round(result.confidence * 100)}
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                  Skor prediksi Karier Teratas
                </p>
                <p className="font-medium text-[#102619]">
                  {result.predicted_category}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl text-[#102619]">
                  Prediksi Karir
                </h2>
                <SlidersHorizontal className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {topPredictions.length > 0 ? (
                  topPredictions.map((prediction) => {
                    const score =
                      prediction.confidence ?? prediction.score ?? 0;
                    return (
                      <div key={prediction.category}>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{prediction.category}</span>
                          <span>{Math.round(score * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1E3A2B] rounded-full"
                            style={{ width: `${score * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400">
                    Distribusi prediksi belum tersedia.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Plane className="w-5 h-5 text-[#102619]" />
                <h2 className="font-serif text-2xl text-[#102619]">
                  Analisis Skill
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                    Skill Dimiliki
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 rounded-full bg-green-100 text-[#1E3A2B] text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Tidak ada data
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                    Perlu Ditambahkan
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Tidak ada data
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAF7] border border-[#E8E8E0] rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#102619]" />
              <h2 className="font-serif text-3xl text-[#102619]">
                Rekomendasi Strategis Path'Ora
              </h2>
            </div>

            <div className="max-w-4xl">
              <p className="text-gray-700 leading-8 whitespace-pre-line">
                {result.description_career_recommendations ||
                  "Belum ada narasi rekomendasi dari hasil analisis ini."}
              </p>

              <Link
                to={`/career-recommendations/${analysis.id}`}
                className="inline-block mt-8 px-8 py-3 border border-[#102619] rounded-lg text-[#102619] hover:bg-[#102619] hover:text-white transition"
              >
                LIHAT RENCANA AKSI DETAIL
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalysisPage;
