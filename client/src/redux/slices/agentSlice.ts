import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { agentService } from "../../services/agent/agentService";
import {
  AgentProcessPayload,
  AgentProcessResult,
  AIExtraction,
} from "../../types";

interface AgentState {
  extraction: AIExtraction | null;
  formPatch: Record<string, unknown>;
  toolResults: Record<string, unknown>;
  selectedTool: string | null;
  response: string | null;
  savedInteractionId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  extraction: null,
  formPatch: {},
  toolResults: {},
  selectedTool: null,
  response: null,
  savedInteractionId: null,
  loading: false,
  error: null,
};

export const processNaturalLanguage = createAsyncThunk(
  "agent/processNaturalLanguage",
  async (payload: AgentProcessPayload) => agentService.process(payload),
);

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    setExtraction(state, action: PayloadAction<AIExtraction>) {
      state.extraction = action.payload;
    },
    updateExtraction(state, action: PayloadAction<Partial<AIExtraction>>) {
      if (!state.extraction) return;
      state.extraction = { ...state.extraction, ...action.payload };
    },
    clearExtraction(state) {
      state.extraction = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processNaturalLanguage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        processNaturalLanguage.fulfilled,
        (state, action: PayloadAction<AgentProcessResult>) => {
          state.loading = false;
          state.extraction = action.payload.extraction;
          state.formPatch = action.payload.formPatch;
          state.toolResults = action.payload.toolResults;
          state.selectedTool = action.payload.selectedTool;
          state.response = action.payload.response;
          state.savedInteractionId =
            action.payload.savedInteractionId ?? state.savedInteractionId;
        },
      )
      .addCase(processNaturalLanguage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "AI extraction failed";
      });
  },
});

export const { clearExtraction, setExtraction, updateExtraction } =
  agentSlice.actions;
export default agentSlice.reducer;
