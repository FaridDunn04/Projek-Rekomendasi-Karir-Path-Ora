import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.tsx";
import { FileText } from "lucide-react";

/**
 * Dashboard Page
 * 
 * Sesuai dengan PRD §3.1 F2 (Dashboard Utama):
 * - Card Ringkasan Analisis Terakhir (kategori prediksi teratas + confidence)
 * - Button Upload CV (CTA utama)
 * - Riwayat Upload (daftar CV/analisis terakhir)
 * - Empty state bila belum upload
 * 
 * Digunakan di: /dashboard route
 */
const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    // Mock data untuk demo (nanti akan replace dengan API call)
    const analysisData = {
        category: "Backend Developer",
        confidence: 72,
        totalAnalysis: 1,
    };

    const uploadHistory = [
        {
            id: 1,
            filename: "CV_Consulting_Final_2024.pdf",
            uploadDate: "12 Okt 2024",
            category: "Backend Developer",
            confidence: 72,
        },
    ];

    return (
        <AppLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
                    Dashboard Utama
                </h1>
                <p className="text-gray-600 mt-2 text-sm">
                    Selamat datang. Berikut adalah ringkasan progress dan kesiapan karir Anda berdasarkan analisis data terbaru.
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-['Newsreader']">
                {/* Card 1: Analysis Summary */}
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

                {/* Card 2: Upload CTA */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-md p-6 flex flex-col justify-center items-center text-white cursor-pointer h-full hover:shadow-lg transition-shadow w-[250px]"
                     onClick={() => navigate("/upload")}>
                    <div className="text-5xl mb-4">📤</div>
                    <h3 className="text-xl font-semibold text-center mb-2">Upload CV Baru</h3>
                    <p className="text-center text-xs text-gray-300 mb-4">
                        Analisis CV baru untuk mendapatkan rekomendasi karir yang lebih akurat
                    </p>
                    <div className="text-center text-xs font-semibold uppercase tracking-wider">
                        Mulai Analisis →
                    </div>
                </div>

                
            </div>

            {/* Upload History Section */}
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
        </AppLayout>
    );
};

export default DashboardPage;
