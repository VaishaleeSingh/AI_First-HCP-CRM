import { apiClient } from "../api/client";

export const doctorService = {
  async list(params?: {
    search?: string;
    city?: string;
    sort?: string;
    page?: number;
  }) {
    const response = await apiClient.get("/hcp", { params });
    return response.data;
  },
  async getById(doctorId: number) {
    const response = await apiClient.get(`/hcp/${doctorId}`);
    return response.data;
  },
};
