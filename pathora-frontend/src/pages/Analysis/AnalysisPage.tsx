

import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import {Sparkles,Plane, ListFilter,SlidersHorizontal} from "lucide-react"
import { useAnalysis } from "../../hooks/useAnalysis";
import {useParams} from "react-router-dom";

const AnalysisPage: React.FC = () => {
    interface Qualification {
        title: string;
        value: number;
    }

    const { analysisId } = useParams<{ analysisId: string }>();

    const { analysis, isLoading, error } = useAnalysis(analysisId);

    const qualifications: Qualification[] = [
        { title: "Technical Skills", value: 85 },
        { title: "Experience", value: 70 },
        { title: "Soft Skills", value: 65 },
        { title: "Education", value: 90 },
        { title: "Certifications", value: 40 },
    ];

    const ownedSkills: string[] = [
        "Figma",
        "UI/UX Design",
        "Prototyping",
        "User Research",
        "Wireframing",
    ];

    const neededSkills: string[] = [
        "Design Systems",
        "HTML/CSS",
        "Agile Methodology",
        "Data Analysis",
    ];
    
    return (
        
        <AppLayout>
            <div className="min-h-screen bg-[#F7F6F2] px-10 pt-0 pb-8 font-['Newsreader']">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="mb-7">
                            <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
                                Hasil Analisis CV
                            </h1>
                            <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
                                Berikut hasil analisi CV berdaarkan data CV terakhir anda.
                            </p>
                        </div>

                        {/* Score Card */}
                        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 min-w-[170px]">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-[#102619]">72</span>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                    Skor Kesiapan
                                </p>
                                <p className="font-medium text-[#102619]">
                                    Cukup Siap
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top Cards Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                        {/* Distribusi Kualifikasi Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-serif text-2xl text-[#102619]">
                                    Distribusi Kualifikasi
                                </h2>
                                <span className="text-gray-400">☰</span>
                            </div>

                            <div className="space-y-3">
                                {qualifications.map((item) => (
                                    <div key={item.title}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>{item.title}</span>
                                            <span>{item.value}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#1E3A2B] rounded-full"
                                                style={{ width: `${item.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skill Gap Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Plane className="w-5 h-5 text-[#102619]"/>
                                <h2 className="font-serif text-2xl text-[#102619] ">
                                    Skill Gap Analysis
                                </h2>

                            </div>
                            
                            <div className="grid grid-cols-2 gap-10">
                                {/* Skill Dimiliki */}
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                                        Skill Dimiliki
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {ownedSkills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 rounded-full bg-green-100 text-[#1E3A2B] text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Perlu Ditambahkan */}
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                                        Perlu Ditambahkan
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {neededSkills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation Section */}
                    <div className="bg-[#F9FAF7] border border-[#E8E8E0] rounded-2xl p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-[#102619]"/>
                            <h2 className="font-serif text-3xl text-[#102619]">
                                Rekomendasi Strategis Path’Ora
                            </h2>
                        </div>
                        

                        <div className="max-w-3xl">
                            <p className="text-gray-700 leading-9 mb-6">
                                Berdasarkan analisis komprehensif, profil Anda menunjukkan
                                fondasi yang kuat dalam praktik desain inti. Namun, untuk
                                mencapai posisi Senior, terdapat kesenjangan yang signifikan
                                dalam pengelolaan Sistem Desain (Design Systems) dan pemahaman
                                teknis dasar.
                            </p>

                            <p className="text-gray-700 leading-9 mb-8">
                                Kami merekomendasikan untuk memprioritaskan sertifikasi atau
                                proyek portofolio yang secara eksplisit mendemonstrasikan
                                kemampuan Anda dalam membangun dan memelihara komponen
                                arsitektur desain yang skalabel. Hal ini akan meningkatkan
                                skor kesiapan Anda melampaui ambang batas 85%.
                            </p>

                            <button className="px-8 py-3 border border-[#102619] rounded-lg text-[#102619] hover:bg-[#102619] hover:text-white transition">
                                LIHAT RENCANA AKSI DETAIL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
export default AnalysisPage;

// import React from "react";
// import AppLayout from "../../components/layout/AppLayout";
// import {
//   Sparkles,
//   Plane,
//   SlidersHorizontal,
// } from "lucide-react";
// import { useAnalysis } from "../../hooks/useAnalysis";
// import { useParams } from "react-router-dom";

// const AnalysisPage: React.FC = () => {
//   const { analysisId } = useParams<{ analysisId: string }>();

//   const { analysis, isLoading, error } = useAnalysis(analysisId);

//   const result = analysis?.result;

//   if (isLoading) {
//     return (
//       <AppLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <p className="text-lg text-gray-600">
//             Memuat hasil analisis...
//           </p>
//         </div>
//       </AppLayout>
//     );
//   }

//   if (error) {
//     return (
//       <AppLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <p className="text-red-500 text-lg">{error}</p>
//         </div>
//       </AppLayout>
//     );
//   }

//   if (!analysis || !result) {
//     return (
//       <AppLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <p className="text-gray-600">
//             Data analisis tidak ditemukan.
//           </p>
//         </div>
//       </AppLayout>
//     );
//   }

//   return (
//     <AppLayout>
//       <div className="min-h-screen bg-[#F7F6F2] px-10 pb-8">
//         <div className="max-w-7xl mx-auto">

//           {/* Header */}
//           <div className="flex justify-between items-start mb-5">
//             <div className="mb-7">
//               <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
//                 Hasil Analisis CV
//               </h1>

//               <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
//                 Berikut hasil analisis CV berdasarkan data CV terakhir Anda.
//               </p>
//             </div>

//             {/* Score Card */}
//             <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 min-w-[190px]">
//               <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
//                 <span className="text-2xl font-bold text-[#102619]">
//                   {Math.round(result.confidence * 100)}
//                 </span>
//               </div>

//               <div>
//                 <p className="text-[10px] uppercase tracking-widest text-gray-500">
//                   Prediksi Karier
//                 </p>

//                 <p className="font-medium text-[#102619]">
//                   {result.predicted_category}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Top Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

//             {/* Top Predictions */}
//             <div className="bg-white rounded-2xl p-6 shadow-sm">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="font-serif text-2xl text-[#102619]">
//                   Distribusi Prediksi
//                 </h2>

//                 <SlidersHorizontal className="w-5 h-5 text-gray-400" />
//               </div>

//               <div className="space-y-4">
//                 {result.top_predictions.map((prediction) => (
//                   <div key={prediction.category}>
//                     <div className="flex justify-between text-sm mb-2">
//                       <span>{prediction.category}</span>

//                       <span>
//                         {Math.round(prediction.score * 100)}%
//                       </span>
//                     </div>

//                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-[#1E3A2B] rounded-full"
//                         style={{
//                           width: `${prediction.score * 100}%`,
//                         }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Skill Gap */}
//             <div className="bg-white rounded-2xl p-6 shadow-sm">
//               <div className="flex items-center gap-2 mb-6">
//                 <Plane className="w-5 h-5 text-[#102619]" />

//                 <h2 className="font-serif text-2xl text-[#102619]">
//                   Skill Gap Analysis
//                 </h2>
//               </div>

//               <div className="grid grid-cols-2 gap-10">

//                 {/* Matched Skills */}
//                 <div>
//                   <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">
//                     Skill Dimiliki
//                   </p>

//                   <div className="flex flex-wrap gap-3">
//                     {result.matched_skills.length > 0 ? (
//                       result.matched_skills.map((skill) => (
//                         <span
//                           key={skill}
//                           className="px-4 py-2 rounded-full bg-green-100 text-[#1E3A2B] text-sm"
//                         >
//                           {skill}
//                         </span>
//                       ))
//                     ) : (
//                       <span className="text-gray-400 text-sm">
//                         Tidak ada data
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Missing Skills */}
//                 <div>
//                   <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">
//                     Perlu Ditambahkan
//                   </p>

//                   <div className="flex flex-wrap gap-3">
//                     {result.missing_skills.length > 0 ? (
//                       result.missing_skills.map((skill) => (
//                         <span
//                           key={skill}
//                           className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm"
//                         >
//                           {skill}
//                         </span>
//                       ))
//                     ) : (
//                       <span className="text-gray-400 text-sm">
//                         Tidak ada data
//                       </span>
//                     )}
//                   </div>
//                 </div>

//               </div>
//             </div>
//           </div>

//           {/* Recommendation */}
//           <div className="bg-[#F9FAF7] border border-[#E8E8E0] rounded-2xl p-8">
//             <div className="flex items-center gap-2 mb-6">
//               <Sparkles className="w-5 h-5 text-[#102619]" />

//               <h2 className="font-serif text-3xl text-[#102619]">
//                 Rekomendasi Strategis Path’Ora
//               </h2>
//             </div>

//             <div className="max-w-4xl">
//               <p className="text-gray-700 leading-8 whitespace-pre-line">
//                 {result.description_career_recommendations}
//               </p>

//               <button className="mt-8 px-8 py-3 border border-[#102619] rounded-lg text-[#102619] hover:bg-[#102619] hover:text-white transition">
//                 LIHAT RENCANA AKSI DETAIL
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   );
// };

// export default AnalysisPage;