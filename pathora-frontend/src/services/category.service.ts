

import { apiClient } from "./api.client";
import { Category, CategoryListResponse } from "../types/category";

export const categoryService = {
  /**
   * Get daftar semua kategori karir
   * GET /categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<CategoryListResponse>("/categories");
      return response.data.categories;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "GET_CATEGORIES_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengambil daftar kategori",
      };
    }
  },
};
