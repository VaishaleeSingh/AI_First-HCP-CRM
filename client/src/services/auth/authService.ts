import { apiClient } from "../api/client";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  },
  async logout() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },
  async me() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
