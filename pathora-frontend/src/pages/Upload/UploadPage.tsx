import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.tsx";
import {Upload} from "lucide-react"



const UploadPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <AppLayout>
            <div className="mb-7 ml-10" >
                <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
                    Upload Curriculum Vitae
                </h1>
                <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
                    <span>Kirimkan riwayat profesional Anda untuk memulai analisis mendalam. Sistem kami</span><br/>
                    <span>secara elegan menguraikan pengalaman Anda menjadi informasi karier yang</span><br/>
                    dapat di tinjak lanjuti
                </p>
            </div>

            <div className="w-full max-w-2xl  mx-auto p-10 bg-white rounded-3xl border border-gray-200 font-['Newsreader']">
                <label htmlFor="file-upload" className="border border-dashed border-gray-400 rounded-3xl h-[340px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-8">
                        <Upload />
                    </div>

                    <h2 className="text-3xl  mb-3">
                    Drag & Drop your document
                    </h2>

                    <p className="text-gray-500 text-center max-w-md mb-8">
                    Supported formats: PDF up to 10MB. Ensure your document is
                    unlocked for optimal extraction.
                    </p>

                    <span className="bg-[#061B0E] text-white px-8 py-3 rounded-lg ">
                    BROWSE FILES
                    </span>

                    <input id="file-upload" type="file" accept=".pdf,.doc,.docx" className="hidden"/>
                </label>
            </div>

            <div>

            </div>

        </AppLayout>
    )
}

export default UploadPage;
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AppLayout from "../../components/layout/AppLayout";
// import { Upload } from "lucide-react";

// import { useCVUpload } from "../../hooks/useCVUpload";
// import { useAnalysis } from "../../hooks/useAnalysis";

// const UploadPage: React.FC = () => {
//     const navigate = useNavigate();

//     const [selectedFile, setSelectedFile] = useState<File | null>(null);

//     const {
//         uploadCV,
//         isLoading,
//         progress,
//         error,
//     } = useCVUpload();

//     const { analyzeCV } = useAnalysis();

//     const handleFileChange = async (
//         e: React.ChangeEvent<HTMLInputElement>
//     ) => {
//         const file = e.target.files?.[0];

//         if (!file) return;

//         setSelectedFile(file);

//         // Upload CV
//         const uploadResult = await uploadCV({
//             source_type: "file",
//             file,
//         });

//         if (!uploadResult) return;

//         // Analisis CV
//         const analysisResult = await analyzeCV(uploadResult.id);

//         if (!analysisResult) return;

//         // Redirect ke halaman hasil analisis
//         navigate(`/analysis/${analysisResult.id}`);
//     };

//     return (
//         <AppLayout>
//             <div className="mb-7 ml-10">
//                 <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
//                     Upload Curriculum Vitae
//                 </h1>

//                 <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
//                     <span>
//                         Kirimkan riwayat profesional Anda untuk memulai analisis
//                         mendalam. Sistem kami
//                     </span>
//                     <br />
//                     <span>
//                         secara elegan menguraikan pengalaman Anda menjadi
//                         informasi karier yang
//                     </span>
//                     <br />
//                     dapat ditindak lanjuti.
//                 </p>
//             </div>

//             <div className="w-full max-w-2xl mx-auto p-10 bg-white rounded-3xl border border-gray-200">
//                 <label
//                     htmlFor="file-upload"
//                     className="border border-dashed border-gray-400 rounded-3xl h-[340px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
//                 >
//                     <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-8">
//                         <Upload size={32} />
//                     </div>

//                     <h2 className="text-3xl font-['Newsreader'] mb-3">
//                         Drag & Drop your document
//                     </h2>

//                     <p className="text-gray-500 text-center max-w-md mb-8">
//                         Supported formats: PDF, DOC, DOCX up to 10MB.
//                         Ensure your document is unlocked for optimal extraction.
//                     </p>

//                     <span className="bg-[#061B0E] text-white px-8 py-3 rounded-lg">
//                         BROWSE FILES
//                     </span>

//                     <input
//                         id="file-upload"
//                         type="file"
//                         accept=".pdf,.doc,.docx"
//                         className="hidden"
//                         onChange={handleFileChange}
//                     />
//                 </label>

//                 {/* File Info */}
//                 {selectedFile && (
//                     <div className="mt-6">
//                         <p className="text-sm text-gray-500 mb-1">
//                             File Dipilih
//                         </p>

//                         <p className="font-medium text-[#102619]">
//                             {selectedFile.name}
//                         </p>
//                     </div>
//                 )}

//                 {/* Progress Upload */}
//                 {isLoading && (
//                     <div className="mt-6">
//                         <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
//                             <div
//                                 className="h-full bg-[#102619] transition-all duration-300"
//                                 style={{
//                                     width: `${progress}%`,
//                                 }}
//                             />
//                         </div>

//                         <p className="text-sm text-gray-600 mt-2">
//                             Uploading... {progress}%
//                         </p>
//                     </div>
//                 )}

//                 {/* Error */}
//                 {error && (
//                     <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
//                         <p className="text-red-600 text-sm">
//                             {error}
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </AppLayout>
//     );
// };

// export default UploadPage;