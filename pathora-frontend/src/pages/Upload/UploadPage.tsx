import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { AlertTriangle, CheckCircle, RefreshCw, Upload, X } from "lucide-react";
import { useCVUpload } from "../../hooks/useCVUpload";
import { useAnalysis } from "../../hooks/useAnalysis";

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const { uploadCV, isLoading, progress, error } = useCVUpload();
  const { analyzeCV, isAnalyzing, error: analyzeError } = useAnalysis();

  const runAnalysis = async (cvId: string) => {
    setAnalysisFailed(false);
    setFeedbackOpen(true);
    const analysisResult = await analyzeCV(cvId);

    if (analysisResult?.id) {
      navigate(`/analysis/${analysisResult.id}`);
      return;
    }

    setAnalysisFailed(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadedCvId(null);
    setAnalysisFailed(false);
    setFeedbackOpen(false);

    const uploadResult = await uploadCV({
      source_type: "file",
      file,
    });

    if (!uploadResult) return;

    setUploadedCvId(uploadResult.id);
    setFeedbackOpen(true);
    await runAnalysis(uploadResult.id);
  };

  const isProcessing = isLoading || isAnalyzing;
  const errorMessage = error || analyzeError;
  const showFeedbackModal =
    isFeedbackOpen && (!!errorMessage || (!!uploadedCvId && !error));
  const isAnalyzeError = analysisFailed && !!uploadedCvId;
  const feedbackTitle = errorMessage
    ? isAnalyzeError
      ? "Analisis AI gagal diproses"
      : "Upload CV gagal"
    : "CV berhasil diunggah";
  const feedbackMessage = errorMessage
    ? errorMessage
    : isAnalyzing
      ? "Sistem sedang mengirim CV ke layanan AI."
      : analysisFailed
        ? "File sudah tersimpan. Analisis dapat dicoba ulang tanpa upload ulang."
        : "CV sudah tersimpan dan analisis sedang diproses.";

  return (
    <AppLayout>
      <div className="mb-7 ml-10">
        <h1 className="text-3xl font-bold font-['Newsreader'] text-gray-900">
          Upload Curriculum Vitae
        </h1>
        <p className="text-gray-600 mt-2 text-sm font-['Manrope',_sans-serif]">
          Kirimkan riwayat profesional Anda untuk memulai analisis mendalam.
          Sistem kami menguraikan pengalaman Anda menjadi informasi karier yang
          dapat ditindaklanjuti.
        </p>
      </div>

      <div className="w-full max-w-2xl mx-auto p-10 bg-white rounded-3xl border border-gray-200 font-['Newsreader']">
        <label
          htmlFor="file-upload"
          className="border border-dashed border-gray-400 rounded-3xl h-[340px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-8">
            <Upload size={32} />
          </div>

          <h2 className="text-3xl mb-3">Drag & Drop your document</h2>
          <p className="text-gray-500 text-center max-w-md mb-8">
            Supported formats: PDF, DOC, DOCX up to 10MB. Ensure your document
            is unlocked for optimal extraction.
          </p>

          <span className="bg-[#061B0E] text-white px-8 py-3 rounded-lg">
            BROWSE FILES
          </span>

          <input
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            disabled={isProcessing}
            onChange={handleFileChange}
          />
        </label>

        {selectedFile && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-1">File Dipilih</p>
            <p className="font-medium text-[#102619]">{selectedFile.name}</p>
          </div>
        )}

        {isProcessing && (
          <div className="mt-6">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#102619] transition-all duration-300"
                style={{ width: `${isAnalyzing ? 100 : progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {isAnalyzing
                ? "Menganalisis CV..."
                : `Uploading... ${progress}%`}
            </p>
          </div>
        )}
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setFeedbackOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Tutup pesan"
            >
              <X size={18} />
            </button>

            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                errorMessage ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {errorMessage ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-700" />
              )}
            </div>

            <h2
              className={`pr-8 text-2xl font-semibold font-['Newsreader'] ${
                errorMessage ? "text-red-700" : "text-[#102619]"
              }`}
            >
              {feedbackTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {feedbackMessage}
            </p>

            {isAnalyzeError && (
              <button
                type="button"
                onClick={() => runAnalysis(uploadedCvId)}
                disabled={isAnalyzing}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#102619] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a26] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} />
                Coba Analisis Ulang
              </button>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default UploadPage;
