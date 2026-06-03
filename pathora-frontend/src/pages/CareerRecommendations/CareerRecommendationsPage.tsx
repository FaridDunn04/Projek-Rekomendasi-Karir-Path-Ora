import React from "react";
import AppLayout from "../../components/layout/AppLayout.tsx";
import JobRecommendationCard from "./Job.tsx";


interface JobRecommendation {
    id: number;
    title: string;
    category: string;
    matchPercentage: number;
    matchingSkills: string[];
    missingSkills: string[];
}

const CareerRecommendationsPage: React.FC = () => {

    const jobRecommendations: JobRecommendation[] = [
        {
            id: 1,
            title: "Senior UI/UX Designer",
            category: "Product Design",
            matchPercentage: 85,
            matchingSkills: ["Figma", "UI Design", "User Research"],
            missingSkills: ["Design Systems", "HTML/CSS"],
        },

        {
            id: 2,
            title: "Product Manager",
            category: "Product Management",
            matchPercentage: 72,
            matchingSkills: ["User Research", "Product Roadmap", "Analytics"],
            missingSkills: ["SQL", "Advanced Analytics"],
        },
    
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#F7F6F2] px-10 pt-0 pb-8 font-['Newsreader']">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-7">
                        <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
                            Rekomendasi Karir
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
                            <span>Berdasarkan analisa keterampilan dan latar belakang profesional Anda baru-baru ini</span><br/>
                            <span>Kami telah menusun jalur karier yang berpotensi tinggi ini yang di sesuaikan</span><br/>
                            denga profil unik Anda.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {jobRecommendations.map((job) => (
                            <JobRecommendationCard key={job.id} job={job} />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

 export default CareerRecommendationsPage;

// import React from "react";
// import { useParams } from "react-router-dom";
// import AppLayout from "../../components/layout/AppLayout";
// import JobRecommendationCard from "./Job";
// import { useCareerRecs } from "../../hooks/useCareerRecs";

// const CareerRecommendationsPage: React.FC = () => {
//     const { analysisId } = useParams<{ analysisId: string }>();

//     const {
//         analysis,
//         isLoading,
//         error,
//     } = useCareerRecs(analysisId);

//     const recommendations =
//         analysis?.result?.career_recommendations || [];

//     return (
//         <AppLayout>
//             <div className="min-h-screen bg-[#F7F6F2] px-10 pb-8">
//                 <div className="max-w-7xl mx-auto">

//                     {/* Header */}
//                     <div className="mb-8">
//                         <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
//                             Rekomendasi Karir
//                         </h1>

//                         <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
//                             Berdasarkan hasil analisis CV dan keterampilan Anda,
//                             berikut beberapa rekomendasi karir yang memiliki
//                             tingkat kecocokan tertinggi.
//                         </p>
//                     </div>

//                     {/* Loading */}
//                     {isLoading && (
//                         <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
//                             Loading career recommendations...
//                         </div>
//                     )}

//                     {/* Error */}
//                     {error && (
//                         <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
//                             {error}
//                         </div>
//                     )}

//                     {/* Analysis Summary */}
//                     {!isLoading && !error && analysis && (
//                         <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
//                             <h2 className="text-xl font-semibold text-[#102619]">
//                                 Hasil Analisis Utama
//                             </h2>

//                             <div className="mt-4 flex flex-col gap-2">
//                                 <div>
//                                     <span className="text-gray-500 text-sm">
//                                         Kategori Karir
//                                     </span>

//                                     <p className="text-lg font-medium text-[#102619]">
//                                         {analysis.predicted_category}
//                                     </p>
//                                 </div>

//                                 <div>
//                                     <span className="text-gray-500 text-sm">
//                                         Confidence Score
//                                     </span>

//                                     <p className="text-lg font-medium text-[#A27A53]">
//                                         {(analysis.confidence * 100).toFixed(1)}%
//                                     </p>
//                                 </div>
//                             </div>

//                             {analysis.result?.description_career_recommendations && (
//                                 <div className="mt-5">
//                                     <p className="text-gray-700 leading-relaxed">
//                                         {
//                                             analysis.result
//                                                 .description_career_recommendations
//                                         }
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Recommendation Cards */}
//                     {!isLoading && !error && (
//                         <div className="space-y-6">
//                             {recommendations.length > 0 ? (
//                                 recommendations.map((career, index) => (
//                                     <JobRecommendationCard
//                                         key={index}
//                                         job={{
//                                             id: index,
//                                             title: career.category,
//                                             category:
//                                                 career.description ||
//                                                 career.category,
//                                             matchPercentage: Math.round(
//                                                 career.match_score * 100
//                                             ),
//                                             matchingSkills:
//                                                 career.matched_skills || [],
//                                             missingSkills:
//                                                 career.missing_skills || [],
//                                         }}
//                                     />
//                                 ))
//                             ) : (
//                                 <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-500">
//                                     Tidak ada rekomendasi karir tersedia.
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </AppLayout>
//     );
// };

// export default CareerRecommendationsPage;