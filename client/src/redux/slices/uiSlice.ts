import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarOpen: boolean;
  interactionTab: "structured" | "ai";
}

const initialState: UiState = {
  sidebarOpen: true,
  interactionTab: "structured",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setInteractionTab(state, action: PayloadAction<UiState["interactionTab"]>) {
      state.interactionTab = action.payload;
    },
  },
});

export const { setInteractionTab, setSidebarOpen, toggleSidebar } =
  uiSlice.actions;
export default uiSlice.reducer;
