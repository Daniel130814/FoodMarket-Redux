// Categorías en Redux (GET /categories, público): chips del catálogo, portada y selector de platos.
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchCategorias = createAsyncThunk(
  "categorias/fetchCategorias",
  async () => {
    const { data: cuerpo } = await axios.get(`${API_URL}/categories`);
    return cuerpo.data ?? []; // la lista vacía llega como null
  },
);

const categoriasSlice = createSlice({
  name: "categorias",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategorias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categoriasSlice.reducer;
