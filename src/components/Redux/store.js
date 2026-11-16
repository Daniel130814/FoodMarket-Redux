// Store de Redux: cada slice se suma en `reducer` a medida que se migra.
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import platosReducer from "./platosSlice";
import categoriasReducer from "./categoriasSlice";
import ingredientesReducer from "./ingredientesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    platos: platosReducer,
    categorias: categoriasReducer,
    ingredientes: ingredientesReducer,
  },
});
