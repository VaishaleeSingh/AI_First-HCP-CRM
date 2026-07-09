import { InteractionFormValues } from "../../types";
import { apiClient } from "../api/client";

const cleanOptionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toInteractionPayload = (payload: InteractionFormValues) => ({
  ...payload,
  additionalNotes: cleanOptionalValue(payload.additionalNotes),
  competitorMentioned: cleanOptionalValue(payload.competitorMentioned),
  doctorFeedback: cleanOptionalValue(payload.doctorFeedback),
  nextFollowUp: cleanOptionalValue(payload.nextFollowUp),
  samplesProvided: cleanOptionalValue(payload.samplesProvided),
});

export const interactionService = {
  async list() {
    const response = await apiClient.get("/interactions");
    return response.data;
  },
  async create(payload: InteractionFormValues) {
    const response = await apiClient.post(
      "/interactions",
      toInteractionPayload(payload),
    );
    return response.data;
  },
  async update(interactionId: number, payload: Partial<InteractionFormValues>) {
    const response = await apiClient.put(`/interactions/${interactionId}`, {
      ...payload,
      ...(payload.additionalNotes !== undefined && {
        additionalNotes: cleanOptionalValue(payload.additionalNotes),
      }),
      ...(payload.competitorMentioned !== undefined && {
        competitorMentioned: cleanOptionalValue(payload.competitorMentioned),
      }),
      ...(payload.doctorFeedback !== undefined && {
        doctorFeedback: cleanOptionalValue(payload.doctorFeedback),
      }),
      ...(payload.nextFollowUp !== undefined && {
        nextFollowUp: cleanOptionalValue(payload.nextFollowUp),
      }),
      ...(payload.samplesProvided !== undefined && {
        samplesProvided: cleanOptionalValue(payload.samplesProvided),
      }),
    });
    return response.data;
  },
  async remove(interactionId: number) {
    const response = await apiClient.delete(`/interactions/${interactionId}`);
    return response.data;
  },
};
