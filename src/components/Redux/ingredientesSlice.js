// Ingredientes en Redux (GET /ingredientes, público): catálogo para armar un plato.
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchIngredientes = createAsyncThunk(
  "ingredientes/fetchIngredientes",
  async () => {
    const { data: cuerpo } = await axios.get(`${API_URL}/ingredientes`);
    return cuerpo.data ?? []; // la lista vacía llega como null
  },
);

const ingredientesSlice = createSlice({
  name: "ingredientes",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIngredientes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default ingredientesSlice.reducer;
