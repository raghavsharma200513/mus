import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./slices/profileReducer.ts"; // Adjust the path as needed

const store = configureStore({
  reducer: {
    profile: profileReducer,
  },
});

// Corrected the type exports for `RootState` and `AppDispatch`
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
