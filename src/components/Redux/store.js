// Store de Redux: por ahora vacío, cada slice se suma en `reducer` a medida que se migra.
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {},
});
