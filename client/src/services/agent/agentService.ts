import { AgentProcessPayload, AgentProcessResult } from "../../types";
import { apiClient } from "../api/client";

export const agentService = {
  async process(payload: AgentProcessPayload): Promise<AgentProcessResult> {
    const response = await apiClient.post("/agent/process", {
      message: payload.message,
      doctorId: payload.doctorId,
      interactionId: payload.interactionId,
      saveRequested: payload.saveRequested ?? false,
    });

    return response.data;
  },
  async chat(message: string, doctorId?: number) {
    const response = await apiClient.post("/chat", {
      message,
      doctorId,
    });

    return response.data;
  },
};
