/**
 * useDashboard Hook
 * Sesuai SDD §13 - Hooks Design
 * Menangani fetch dashboard summary dan analysis history
 */

import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboard.service";
import { analysisService } from "../services/analysis.service";
import { Analysis } from "../types/analysis";
import { DashboardSummary, AnalysisHistoryItem } from "../types/dashboard";
import { parseApiError } from "../utils/error";

export interface DashboardState {
  summary: DashboardSummary | null;
  history: AnalysisHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    summary: null,
    history: [],
    isLoading: false,
    error: null,
  });

  const mapAnalysisToHistoryItem = (
    analysis: Analysis,
  ): AnalysisHistoryItem => ({
    id: analysis.id,
    cv_id: analysis.cv_id,
    predicted_category:
      analysis.predicted_category ||
      analysis.result?.predicted_category ||
      "Belum ada prediksi",
    confidence: Number.isFinite(Number(analysis.confidence))
      ? Number(analysis.confidence)
      : 0,
    created_at: analysis.created_at || analysis.analyzed_at || "",
    status: analysis.status,
  });

  const fetchDashboard = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [summary, analyses] = await Promise.all([
        dashboardService.getDashboardSummary(),
        analysisService.getAllAnalyses(),
      ]);
      const history = analyses.map(mapAnalysisToHistoryItem);

      setState((prev) => ({
        ...prev,
        summary: {
          ...summary,
          latest_analysis: history[0] ?? summary.latest_analysis,
          total_analyses: history.length,
        },
        history,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: parseApiError(error),
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const refresh = async () => {
    await fetchDashboard();
  };

  return {
    ...state,
    refresh,
  };
}
