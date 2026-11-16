// Platos en Redux: la lista (GET /platos con filtros), el plato del detalle (GET /platos/{id}) y el recomendado de la portada.
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

// Plato destacado de la portada: el filtro `nombre` busca por coincidencia parcial; se queda con uno visible.
export const fetchPlatoRecomendado = createAsyncThunk(
  "platos/fetchPlatoRecomendado",
  async (nombre) => {
    const { data: cuerpo } = await axios.get(`${API_URL}/platos`, {
      params: { nombre },
    });
    const visible = (cuerpo.data ?? []).find(
      (plato) => plato.estado === "PUBLICADO" || plato.estado === "AGOTADO",
    );
    return visible ?? null;
  },
);

const platosSlice = createSlice({
  name: "platos",
  initialState: {
    items: [],
    platoActual: null,
    recomendado: null,
    loading: false,
    error: null,
  },
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
      })
      // Solo fulfilled: si falla la portada cae al primer plato, sin tocar loading ni error de la lista.
      .addCase(fetchPlatoRecomendado.fulfilled, (state, action) => {
        state.recomendado = action.payload;
      });
  },
});

export default platosSlice.reducer;
