import { configureStore } from '@reduxjs/toolkit';
import consultationReducer from './slices/consultationSlice';

export const store = configureStore({
  reducer: {
    consultation: consultationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;