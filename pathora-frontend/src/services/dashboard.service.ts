
import { apiClient } from "./api.client";
import { DashboardSummary, DashboardSummaryResponse, AnalysisHistoryResponse } from "../types/dashboard";

export const dashboardService = {
  /**
   * Get dashboard summary (analisis terakhir + statistik)
   * GET /dashboard/summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await apiClient.get<DashboardSummaryResponse>("/dashboard/summary");
      return response.data.summary;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "GET_DASHBOARD_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengambil dashboard",
      };
    }
  },

  /**
   * Get analysis history untuk dashboard
   * GET /dashboard/analysis-history
   */
  async getAnalysisHistory(limit: number = 5): Promise<AnalysisHistoryResponse> {
    try {
      const response = await apiClient.get<AnalysisHistoryResponse>("/dashboard/analysis-history", {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "GET_HISTORY_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengambil riwayat analisis",
      };
    }
  },
};
