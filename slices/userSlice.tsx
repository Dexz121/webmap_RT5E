//slices/userSlice.tsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true, // estado de carga inicial
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.isLoading = false; // ya cargó
    },
    clearUser(state) {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isLoading = false; // ya cargó (pero sin usuario)
    },
    setLoading(state, action) {
      state.isLoading = action.payload; // permite setearlo manualmente si quieres
    },
  },
});

export const { setUser, clearUser, setLoading } = userSlice.actions;

export const selectUser = (state) => state.user.user;
export const selectRole = (state) => state.user.role;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectIsLoading = (state) => state.user.isLoading;

export default userSlice.reducer;
