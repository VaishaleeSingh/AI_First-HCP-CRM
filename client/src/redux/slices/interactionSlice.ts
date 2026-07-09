import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { interactionService } from "../../services/interaction/interactionService";
import { Interaction, InteractionFormValues } from "../../types";

const seededInteractions: Interaction[] = [
  {
    id: 101,
    doctorId: 1,
    hospitalId: 1,
    doctorName: "Dr. Kavita Sharma",
    hospitalName: "Apollo Health City",
    meetingDate: "2026-07-04",
    meetingTime: "10:30",
    durationMinutes: 35,
    purpose: "New trial discussion",
    discussion:
      "Reviewed updated diabetes trial outcomes, adherence barriers, and patient education needs.",
    productsDiscussed: ["GlucoZen XR"],
    samplesProvided: "Requested 20 starter sample packs",
    doctorFeedback: "Positive about trial endpoints and patient convenience.",
    interestLevel: "high",
    competitorMentioned: "DiaBalance",
    nextFollowUp: "2026-07-14",
    additionalNotes: "Share renal subgroup data before next visit.",
    visitStatus: "completed",
    summary: "Doctor responded positively to new data and requested samples.",
    sentiment: "positive",
    actionItems: [
      "Send renal subgroup data",
      "Arrange samples",
      "Schedule July 14 follow-up",
    ],
    confidenceScore: 0.91,
    createdAt: "2026-07-04T11:10:00",
    updatedAt: "2026-07-04T11:10:00",
  },
];

interface InteractionState {
  interactions: Interaction[];
  draft: Partial<InteractionFormValues>;
  loading: boolean;
  error: string | null;
}

const initialState: InteractionState = {
  interactions: seededInteractions,
  draft: {},
  loading: false,
  error: null,
};

export const createInteraction = createAsyncThunk(
  "interaction/create",
  async (payload: InteractionFormValues) => interactionService.create(payload),
);

const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    saveDraft(state, action: PayloadAction<Partial<InteractionFormValues>>) {
      state.draft = action.payload;
    },
    clearDraft(state) {
      state.draft = {};
    },
    addLocalInteraction(state, action: PayloadAction<Interaction>) {
      state.interactions.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.interactions.unshift(action.payload);
        state.draft = {};
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unable to save interaction";
      });
  },
});

export const { addLocalInteraction, clearDraft, saveDraft } =
  interactionSlice.actions;
export default interactionSlice.reducer;
