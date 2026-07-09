import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authService, LoginPayload } from "../../services/auth/authService";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  territory: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("hcp_crm_token"),
  user: {
    id: 1,
    name: "Aarav Mehta",
    email: "aarav.mehta@pharma.example",
    role: "field_representative",
    territory: "Mumbai Central",
  },
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload) => {
    return authService.login(payload);
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("hcp_crm_token");
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
        localStorage.setItem("hcp_crm_token", action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unable to sign in";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
