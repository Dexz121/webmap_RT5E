// slices/navSlice.tsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  origin: null,
  destination: null,
  travelTimeInformation: null,
  tipoViaje: 'viaje', // nuevo estado
};

export const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    setOrigin: (state, action) => {
      state.origin = action.payload;
    },
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    setTravelTimeInformation: (state, action) => {
      state.travelTimeInformation = action.payload;
    },
    setTipoViaje: (state, action) => {
      state.tipoViaje = action.payload; // 'viaje' o 'paquete'
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setTravelTimeInformation,
  setTipoViaje,
} = navSlice.actions;

export const selectOrigin = (state) => state.nav.origin;
export const selectDestination = (state) => state.nav.destination;
export const selectTravelTimeInformation = (state) => state.nav.travelTimeInformation;
export const selectTipoViaje = (state) => state.nav.tipoViaje;

export default navSlice.reducer;
