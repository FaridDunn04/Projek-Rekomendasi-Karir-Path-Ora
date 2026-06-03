import React from "react";
import {apiClient} from "../services/api.client";
import { User, UpdateProfileRequest } from "../types/auth";

export const userService={
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<{ data: User }>("/users/profile");
      return response.data.data;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "GET_PROFILE_ERROR",
        message: error.response?.data?.error?.message || "Gagal mengambil profil pengguna",
      };
    };
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<User> {
    try {
      const response = await apiClient.put<{ data: User }>("/users/profile", {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });
      return response.data.data;
    }
    catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "UPDATE_PROFILE_ERROR",
        message: error.response?.data?.error?.message || "Gagal memperbarui profil pengguna",
      };
    }
  },

  async uploadProfilePhoto(
    formData: FormData
  ): Promise<User> {
      const response = await apiClient.post(
          "/users/profile/photo",
          formData,
          {
              headers: {
                  "Content-Type": "multipart/form-data",
              },
          }
      );

      return response.data.data;
  }

}