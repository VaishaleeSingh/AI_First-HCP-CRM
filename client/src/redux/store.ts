import { configureStore } from "@reduxjs/toolkit";
import agentReducer from "./slices/agentSlice";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import dashboardReducer from "./slices/dashboardSlice";
import doctorReducer from "./slices/doctorSlice";
import interactionReducer from "./slices/interactionSlice";
import notificationReducer from "./slices/notificationSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    agent: agentReducer,
    auth: authReducer,
    chat: chatReducer,
    dashboard: dashboardReducer,
    doctor: doctorReducer,
    interaction: interactionReducer,
    notification: notificationReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
