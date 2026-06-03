import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import SkorDashboard from "./SkorDashboard";
import UploadCv from "./UploadCv";
import Riwayat from "./Riwayat";
import { useDashboard } from "../../hooks/useDashboard";

const DashboardPage: React.FC = () => {
  const { summary, history, isLoading, error } = useDashboard();

  return (
    <AppLayout>
      <div className="mb-8 ml-10">
        <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
          Dashboard Utama
        </h1>
        <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
          Selamat datang. Berikut adalah ringkasan progress dan kesiapan karir
          Anda berdasarkan analisis data terbaru.
        </p>
      </div>

      {error && (
        <div className="ml-10 mr-10 mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-['Newsreader'] ml-10">
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-64 animate-pulse" />
        ) : (
          <SkorDashboard summary={summary} />
        )}
        <UploadCv />
      </div>

      <div className="ml-10 mr-10">
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-sm text-gray-500">
            Memuat riwayat analisis...
          </div>
        ) : (
          <Riwayat history={history} />
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
