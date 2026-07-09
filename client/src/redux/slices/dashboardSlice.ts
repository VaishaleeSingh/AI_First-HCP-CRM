import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dashboardService } from "../../services/dashboard/dashboardService";
import { DashboardSummary } from "../../types";

interface DashboardState {
  summary: DashboardSummary;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: {
    todaysVisits: 8,
    upcomingMeetings: 14,
    pendingFollowUps: 6,
    completionRate: 86,
    averageConfidence: 91,
    recentInteractions: [],
  },
  loading: false,
  error: null,
};

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async () => dashboardService.getSummary(),
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unable to load dashboard";
      });
  },
});

export default dashboardSlice.reducer;
