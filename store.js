import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import navReducer from "./slices/navSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        nav:navReducer,
    }
})