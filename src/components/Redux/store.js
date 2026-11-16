// Store de Redux: cada slice se suma en `reducer` a medida que se migra.
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: { auth: authReducer },
});
