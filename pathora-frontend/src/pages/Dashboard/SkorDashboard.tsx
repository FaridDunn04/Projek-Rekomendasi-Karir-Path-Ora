import React from "react";
import { useNavigate } from "react-router-dom";



const SkorDashboard: React.FC = () => {
    const navigate = useNavigate();
    
        // Mock data untuk demo (nanti akan replace dengan API call)
       interface AnalysisData {
            category: string;
            confidence: number;
            totalAnalysis: number;
        }

        const analysisData: AnalysisData = {
            category: "Backend Developer",
            confidence: 72,
            totalAnalysis: 1,
        };

    return (
        <div className="  bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-full">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Skor Kesiapan Kerja
                    </h2>

                    <div className="flex flex-col items-center justify-center">
                        {/* Circular Progress */}
                        <div className="relative w-32 h-32 mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                                {/* Background circle */}
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    fill="none"
                                    stroke="#8b6f47"
                                    strokeWidth="8"
                                    strokeDasharray={`${(analysisData.confidence / 100) * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">
                                    {analysisData.confidence}
                                </span>
                                <span className="text-xs text-gray-600">/100</span>
                            </div>
                        </div>

                        {/* Category & Description */}
                        <h3 className="text-center font-semibold text-gray-900 text-sm mb-2">
                            {analysisData.category}
                        </h3>
                        <p className="text-center text-xs text-gray-600">
                            Profil Anda menunjukkan potensi tinggi pada sektor professional layanan premium.
                        </p>
                    </div>
                </div>
    )
}
export default SkorDashboard;


// import React from "react";
// import { DashboardSummary } from "../../types/dashboard";

// interface Props {
//     summary: DashboardSummary | null;
// }

// const SkorDashboard: React.FC<Props> = ({ summary }) => {
//     const latestAnalysis = summary?.latest_analysis;

//     const confidence = latestAnalysis
//         ? Math.round(latestAnalysis.confidence * 100)
//         : 0;

//     const category =
//         latestAnalysis?.predicted_category ??
//         "Belum Ada Analisis";

//     const totalAnalysis =
//         summary?.total_analyses ?? 0;

//     const circumference = 2 * Math.PI * 56;

//     return (
//         <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-full">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Skor Kesiapan Kerja
//             </h2>

//             <div className="flex flex-col items-center justify-center">
//                 {/* Circle Score */}
//                 <div className="relative w-32 h-32 mb-4">
//                     <svg className="w-full h-full transform -rotate-90">
//                         <circle
//                             cx="64"
//                             cy="64"
//                             r="56"
//                             fill="none"
//                             stroke="#E5E7EB"
//                             strokeWidth="8"
//                         />

//                         <circle
//                             cx="64"
//                             cy="64"
//                             r="56"
//                             fill="none"
//                             stroke="#8B6F47"
//                             strokeWidth="8"
//                             strokeDasharray={`${(confidence / 100) * circumference} ${circumference}`}
//                             strokeLinecap="round"
//                         />
//                     </svg>

//                     <div className="absolute inset-0 flex flex-col items-center justify-center">
//                         <span className="text-2xl font-bold text-gray-900">
//                             {confidence}
//                         </span>

//                         <span className="text-xs text-gray-500">
//                             /100
//                         </span>
//                     </div>
//                 </div>

//                 <h3 className="text-center font-semibold text-gray-900 text-sm mb-2">
//                     {category}
//                 </h3>

//                 <p className="text-center text-xs text-gray-500">
//                     Total Analisis: {totalAnalysis}
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default SkorDashboard;