import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "../../types";

interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = {
  messages: [
    {
      id: nanoid(),
      role: "assistant",
      content:
        "Tell me about the HCP visit. I will extract the doctor, products, sentiment, action items, and follow-up details.",
      createdAt: new Date().toISOString(),
    },
  ],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: {
      reducer(state, action: PayloadAction<ChatMessage>) {
        state.messages.push(action.payload);
      },
      prepare(role: ChatMessage["role"], content: string) {
        return {
          payload: {
            id: nanoid(),
            role,
            content,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
    clearMessages(state) {
      state.messages = initialState.messages;
    },
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
