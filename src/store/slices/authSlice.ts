import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}


const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ayunidan_token');
  }
  return null;
};

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('ayunidan_user');
    return savedUser ? JSON.parse(savedUser) : null;
  }
  return null;
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{ user: UserProfile; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayunidan_token', action.payload.token);
        localStorage.setItem('ayunidan_user', JSON.stringify(action.payload.user));
      }
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('ayunidan_token');
        localStorage.removeItem('ayunidan_user');
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
});

export const { authStart, authSuccess, authFailure, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;