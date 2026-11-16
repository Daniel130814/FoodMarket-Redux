// Reseñas en Redux (GET públicos): las de un plato (detalle), las de un chef (perfil del chef) y todas (catálogo, inicio, admin).
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchResenasByPlato = createAsyncThunk(
  "resenas/fetchResenasByPlato",
  async (platoId) => {
    const { data: cuerpo } = await axios.get(
      `${API_URL}/resenas/plato/${platoId}`,
    );
    return cuerpo.data ?? []; // la lista vacía llega como null
  },
);

export const fetchResenasByChef = createAsyncThunk(
  "resenas/fetchResenasByChef",
  async (chefId) => {
    const { data: cuerpo } = await axios.get(
      `${API_URL}/resenas/chef/${chefId}`,
    );
    return cuerpo.data ?? []; // sin reseñas llega null
  },
);

export const fetchResenas = createAsyncThunk(
  "resenas/fetchResenas",
  async () => {
    const { data: cuerpo } = await axios.get(`${API_URL}/resenas`);
    return cuerpo.data ?? [];
  },
);

// DELETE /resenas/{id} (autor o ADMIN): ruta privada, el token viaja en el argumento. Devuelve el id borrado.
export const deleteResena = createAsyncThunk(
  "resenas/deleteResena",
  async ({ id, token }) => {
    await axios.delete(`${API_URL}/resenas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  },
);

const resenasSlice = createSlice({
  name: "resenas",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResenasByPlato.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResenasByPlato.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchResenasByPlato.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchResenasByChef.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResenasByChef.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchResenasByChef.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchResenas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResenas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchResenas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Solo fulfilled: el borrado no toca loading ni error de la lista. Se saca la reseña sin volver a pedirlas.
      .addCase(deleteResena.fulfilled, (state, action) => {
        state.items = state.items.filter((resena) => resena.id !== action.payload);
      });
  },
});

export default resenasSlice.reducer;
