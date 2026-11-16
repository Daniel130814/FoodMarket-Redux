// Sesión (JWT) en Redux: quién está logueado, su token y su rol. No se guarda en ningún storage.
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Única excepción con try/catch: así se muestra el mensaje del backend (credenciales inválidas).
export const login = createAsyncThunk(
  "auth/login",
  async (credenciales, { rejectWithValue }) => {
    try {
      const { data: auth } = await axios.post(
        `${API_URL}/api/v1/auth/authenticate`,
        credenciales,
      );
      const { access_token, userId, role } = auth.data; // access_token, no token
      // El login no trae el nombre ni el rol en el JWT: se completa con GET /users/me
      const { data: me } = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return { token: access_token, user: { ...me.data, userId, role } };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ?? "No se pudo conectar con el servidor",
      );
    }
  },
);

// Igual que login: el usuario duplicado es un 400 y el mensaje del backend llega por rejectWithValue.
export const register = createAsyncThunk(
  "auth/register",
  async (datos, { rejectWithValue }) => {
    try {
      const { data: auth } = await axios.post(
        `${API_URL}/api/v1/auth/register`,
        datos,
      );
      const { access_token, userId, role } = auth.data;
      // El registro no trae el nombre: se usa el del formulario (no hace falta GET /users/me)
      return { token: access_token, user: { userId, role, nombre: datos.nombre } };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ?? "No se pudo conectar con el servidor",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => initialState, // vuelve al estado inicial: no hay nada más que borrar
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // mensaje del backend (rejectWithValue)
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
