// Reseñas en Redux (GET públicos): las de un plato (detalle) y todas (perfil del chef, que las recorta por sus platos).
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

export const fetchResenas = createAsyncThunk(
  "resenas/fetchResenas",
  async () => {
    const { data: cuerpo } = await axios.get(`${API_URL}/resenas`);
    return cuerpo.data ?? [];
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
      });
  },
});

export default resenasSlice.reducer;
