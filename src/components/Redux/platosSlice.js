// Platos en Redux: la lista del catálogo (GET /platos con filtros) y el plato abierto en el detalle (GET /platos/{id}).
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Los filtros (nombre, categoriaId, precioMin, precioMax) viajan como query params.
export const fetchPlatos = createAsyncThunk(
  "platos/fetchPlatos",
  async (filtros) => {
    const { data: cuerpo } = await axios.get(`${API_URL}/platos`, {
      params: filtros,
    });
    return cuerpo.data ?? []; // la lista vacía llega como null
  },
);

export const fetchPlatoById = createAsyncThunk(
  "platos/fetchPlatoById",
  async (id) => {
    const { data: cuerpo } = await axios.get(`${API_URL}/platos/${id}`);
    return cuerpo.data;
  },
);

const platosSlice = createSlice({
  name: "platos",
  initialState: { items: [], platoActual: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPlatos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPlatoById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.platoActual = null; // evita mostrar el plato anterior
      })
      .addCase(fetchPlatoById.fulfilled, (state, action) => {
        state.loading = false;
        state.platoActual = action.payload;
      })
      .addCase(fetchPlatoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default platosSlice.reducer;
