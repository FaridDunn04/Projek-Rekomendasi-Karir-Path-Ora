

import { apiClient } from "./api.client";
import { CV, CVUploadRequest, CVUploadResponse, CVListResponse } from "../types/cv";
import { AnalyzeResponse } from "../types/analysis";

export const cvService = {
  /**
   * Upload CV (teks atau file)
   * POST /cvs
   * Menggunakan FormData jika upload file
   */
  async uploadCV(payload: CVUploadRequest): Promise<CVUploadResponse> {
    try {
      let data: any;

      if (payload.source_type === "file" && payload.file) {
        // Upload file menggunakan FormData
        const formData = new FormData();
        formData.append("source_type", payload.source_type);
        formData.append("file", payload.file);

        const response = await apiClient.post<CVUploadResponse>("/cvs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      } else {
        // Upload teks CV
        data = {
          source_type: "text",
          raw_text: payload.raw_text,
        };

        const response = await apiClient.post<CVUploadResponse>("/cvs", data);
        return response.data;
      }
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "CV_UPLOAD_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengunggah CV",
      };
    }
  },

  /**
   * Get satu CV berdasarkan ID
   * GET /cvs/:id
   */
  async getCV(cvId: string): Promise<CV> {
    try {
      const response = await apiClient.get<{ cv: CV }>(`/cvs/${cvId}`);
      return response.data.cv;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "GET_CV_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengambil CV",
      };
    }
  },

  /**
   * Trigger analisis untuk CV
   * POST /cvs/:id/analyze
   * Ini mengirim CV ke AI service dan menyimpan hasil
   */
  async analyzeCV(cvId: string): Promise<AnalyzeResponse> {
    try {
      const response = await apiClient.post<AnalyzeResponse>(`/cvs/${cvId}/analyze`);
      return response.data;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "CV_ANALYZE_ERROR",
        message: error.response?.data?.error?.message || "Gagal menganalisis CV",
      };
    }
  },

  /**
   * Get daftar CV pengguna
   * GET /cvs
   */
  async getCVList(page: number = 1, limit: number = 10): Promise<CVListResponse> {
    try {
      const response = await apiClient.get<CVListResponse>("/cvs", {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "GET_CV_LIST_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengambil daftar CV",
      };
    }
  },
};
