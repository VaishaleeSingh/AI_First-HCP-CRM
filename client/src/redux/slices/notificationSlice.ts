import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  tone: "success" | "error" | "info";
}

interface NotificationState {
  items: ToastNotification[];
}

const initialState: NotificationState = {
  items: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    pushToast: {
      reducer(state, action: PayloadAction<ToastNotification>) {
        state.items.push(action.payload);
      },
      prepare(notification: Omit<ToastNotification, "id">) {
        return {
          payload: {
            id: nanoid(),
            ...notification,
          },
        };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { dismissToast, pushToast } = notificationSlice.actions;
export default notificationSlice.reducer;
