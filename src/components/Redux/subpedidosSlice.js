// Subpedidos del chef en Redux (GET privado): alimenta el dashboard de ventas. Pedidos recibidos sigue con su fetch.
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "./authSlice";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = { items: [], loading: false, error: null };

// Ruta privada: el token y el userId (en la API el chefId es el id del usuario) viajan en el argumento.
export const fetchSubpedidosChef = createAsyncThunk(
  "subpedidos/fetchSubpedidosChef",
  async ({ token, userId }) => {
    const { data: cuerpo } = await axios.get(
      `${API_URL}/subpedidos/chef/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return cuerpo.data ?? []; // la lista vacía llega como null
  },
);

const subpedidosSlice = createSlice({
  name: "subpedidos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubpedidosChef.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = []; // evita mostrar los datos de otro chef mientras llegan los nuevos
      })
      .addCase(fetchSubpedidosChef.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubpedidosChef.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Al cerrar sesión se vacían: el próximo chef no ve las ventas del anterior.
      .addCase(logout, () => initialState);
  },
});

export default subpedidosSlice.reducer;
