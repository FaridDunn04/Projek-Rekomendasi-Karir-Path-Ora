import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.tsx";
import { FileText } from "lucide-react";
import SkorDashboard from "./SkorDashboard.tsx";
import UploadCv from "./UploadCv.tsx";
import Riwayat from "./Riwayat.tsx";

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

    return (
        <AppLayout>
            {/* Page Header */}
            <div className="mb-8 ml-10">
                <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
                    Dashboard Utama
                </h1>
                <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
                    Selamat datang. Berikut adalah ringkasan progress dan kesiapan karir Anda berdasarkan analisis data terbaru.
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-['Newsreader'] ml-10">
                {/* Card 1: Analysis Summary */}
                <SkorDashboard />
                {/* Card 2: Upload CTA */}
                <UploadCv />   
            </div>
            {/* Upload History Section */}
            <div className="ml-10 mr-10">
                <Riwayat />
            </div>
            
        </AppLayout>
    );
};

export default DashboardPage;


// import React from "react";
// import AppLayout from "../../components/layout/AppLayout";

// import SkorDashboard from "./SkorDashboard";
// import UploadCv from "./UploadCv";
// import Riwayat from "./Riwayat";

// import { useDashboard } from "../../hooks/useDashboard";

// const DashboardPage: React.FC = () => {
//     const {
//         summary,
//         history,
//         isLoading,
//         error,
//     } = useDashboard();

//     if (isLoading) {
//         return (
//             <AppLayout>
//                 <div className="p-10">
//                     <p>Loading dashboard...</p>
//                 </div>
//             </AppLayout>
//         );
//     }

//     if (error) {
//         return (
//             <AppLayout>
//                 <div className="p-10">
//                     <p className="text-red-500">{error}</p>
//                 </div>
//             </AppLayout>
//         );
//     }

//     return (
//         <AppLayout>
//             {/* Header */}
//             <div className="mb-8 ml-10">
//                 <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
//                     Dashboard Utama
//                 </h1>

//                 <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
//                     Selamat datang. Berikut adalah ringkasan progress dan
//                     kesiapan karir Anda berdasarkan analisis data terbaru.
//                 </p>
//             </div>

//             {/* Main Content */}
//             <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ml-10">
//                 <SkorDashboard summary={summary} />

//                 <UploadCv />
//             </div>

//             {/* Riwayat */}
//             <div className="ml-10 mr-10">
//                 <Riwayat history={history} />
//             </div>
//         </AppLayout>
//     );
// };

// export default DashboardPage;