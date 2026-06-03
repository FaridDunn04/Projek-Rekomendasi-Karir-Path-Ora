import Reat from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";



const Riwayat: React.FC = () => {
    const navigate = useNavigate();

    interface UploadHistory{
        id :number;
        filename:string;
        uploadDate:string;
        category:string;
        confidence:number;
    }

    const uploadHistory:UploadHistory[]= [
        {
            id: 1,
            filename: "CV_Consulting_Final_2024.pdf",
            uploadDate: "12 Okt 2024",
            category: "Backend Developer",
            confidence: 72,
        },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden font-['Newsreader']">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Riwayat Upload</h2>
                    <a href="#" className="text-xs font-semibold text-black hover:text-blue-700">
                        LIHAT SEMUA
                    </a>
                </div>

                {/* Content */}
                {uploadHistory.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {uploadHistory.map((item) => (
                            <div
                                key={item.id}
                                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/analysis/${item.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* File Icon */}
                                        <div className="text-2xl rounded-lg bg-[#F4F9F4] p-2 text-gray-900 border">
                                            <FileText size={18}/>
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">
                                                {item.filename}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Diupload pada {item.uploadDate}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {item.category}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Confidence: {item.confidence}%
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="text-gray-400 ml-4">→</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-gray-600 text-sm font-medium">
                            Belum ada riwayat upload
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Mulai dengan upload CV Anda untuk analisis pertama kali
                        </p>
                    </div>
                )}
            </div>
    )
}
export default Riwayat;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { FileText } from "lucide-react";

// import { AnalysisHistoryItem } from "../../types/dashboard";

// interface Props {
//     history: AnalysisHistoryItem[];
// }

// const Riwayat: React.FC<Props> = ({ history }) => {
//     const navigate = useNavigate();

//     return (
//         <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden font-['Newsreader']">

//             {/* Header */}
//             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                     Riwayat Upload
//                 </h2>

//                 <button className="text-xs font-semibold text-black hover:text-blue-700">
//                     LIHAT SEMUA
//                 </button>
//             </div>

//             {/* Content */}
//             {history.length > 0 ? (
//                 <div className="divide-y divide-gray-200">
//                     {history.map((item) => (
//                         <div
//                             key={item.id}
//                             className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
//                             onClick={() =>
//                                 navigate(`/analysis/${item.id}`)
//                             }
//                         >
//                             <div className="flex items-center justify-between">

//                                 {/* Left */}
//                                 <div className="flex items-start gap-4 flex-1">
//                                     <div className="rounded-lg bg-[#F4F9F4] p-2 border">
//                                         <FileText size={18} />
//                                     </div>

//                                     <div>
//                                         <p className="font-medium text-gray-900 text-sm">
//                                             {item.predicted_category}
//                                         </p>

//                                         <p className="text-xs text-gray-500 mt-1">
//                                             {new Date(
//                                                 item.created_at
//                                             ).toLocaleDateString(
//                                                 "id-ID"
//                                             )}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Right */}
//                                 <div className="text-right">
//                                     <p className="text-sm font-semibold text-gray-900">
//                                         {Math.round(
//                                             item.confidence * 100
//                                         )}
//                                         %
//                                     </p>

//                                     <p className="text-xs text-gray-500 mt-1 capitalize">
//                                         {item.status}
//                                     </p>
//                                 </div>

//                                 <div className="text-gray-400 ml-4">
//                                     →
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <div className="px-6 py-12 text-center">
//                     <div className="text-4xl mb-3">
//                         📭
//                     </div>

//                     <p className="text-gray-600 text-sm font-medium">
//                         Belum ada riwayat analisis
//                     </p>

//                     <p className="text-gray-500 text-xs mt-1">
//                         Mulai dengan upload CV Anda untuk analisis pertama kali
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Riwayat;