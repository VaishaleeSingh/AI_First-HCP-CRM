import { DashboardSummary } from "../../types";
import { apiClient } from "../api/client";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get("/dashboard");
    return response.data;
  },
};
