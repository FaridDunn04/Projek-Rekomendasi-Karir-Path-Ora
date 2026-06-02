
import { apiClient } from "./api.client";
import { Analysis, AnalysisListResponse } from "../types/analysis";

export const analysisService = {
  /**
   * Get hasil analisis berdasarkan ID
   * GET /analyses/:id
   */
  async getAnalysis(analysisId: string): Promise<Analysis> {
    try {
      const response = await apiClient.get<{ analysis: Analysis }>(`/analyses/${analysisId}`);
      return response.data.analysis;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "GET_ANALYSIS_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengambil hasil analisis",
      };
    }
  },

  /**
   * Get daftar semua analisis pengguna
   * GET /analyses
   */
  async getAnalyses(page: number = 1, limit: number = 10): Promise<AnalysisListResponse> {
    try {
      const response = await apiClient.get<AnalysisListResponse>("/analyses", {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "GET_ANALYSES_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengambil daftar analisis",
      };
    }
  },

  /**
   * Get analysis history untuk dashboard
   * GET /analyses?limit=5 (most recent)
   */
  async getAnalysisHistory(limit: number = 5): Promise<AnalysisListResponse> {
    return this.getAnalyses(1, limit);
  },
};
