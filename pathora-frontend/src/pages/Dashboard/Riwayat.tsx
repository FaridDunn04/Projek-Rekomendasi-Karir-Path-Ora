import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { AnalysisHistoryItem } from "../../types/dashboard";

interface Props {
  history: AnalysisHistoryItem[];
}

const Riwayat: React.FC<Props> = ({ history }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden font-['Newsreader']">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Riwayat Upload</h2>
        <button className="text-xs font-bold text-gray-500 hover:text-black tracking-wider uppercase">
          LIHAT SEMUA
        </button>
      </div>

      {history.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {history.map((item) => (
            <div
              key={item.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => navigate(`/analysis/${item.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="rounded-xl bg-[#F4F9F4] p-2 border border-emerald-100 text-emerald-800">
                    <FileText size={18} />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.predicted_category}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("id-ID")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {Math.round(item.confidence * 100)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {item.status}
                  </p>
                </div>

                <div className="text-gray-300 ml-4 hidden sm:block">-&gt;</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-100 p-3 rounded-full mb-3 text-gray-400">
            <FileText size={24} />
          </div>
          <p className="text-gray-900 text-sm font-bold">
            Belum ada dokumen yang diunggah.
          </p>
        </div>
      )}
    </div>
  );
};

export default Riwayat;