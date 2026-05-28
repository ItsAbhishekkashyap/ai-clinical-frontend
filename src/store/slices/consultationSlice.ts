import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Consultation } from '@/lib/api';

interface ConsultationState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  data: Consultation | null;
  error: string | null;
}

const initialState: ConsultationState = {
  status: 'idle',
  data: null,
  error: null,
};

const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<ConsultationState['status']>) => {
      state.status = action.payload;
    },
    setConsultationData: (state, action: PayloadAction<Consultation>) => {
      state.data = action.payload;
      state.status = 'success';
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'error';
    },
    resetConsultation: (state) => {
      state.status = 'idle';
      state.data = null;
      state.error = null;
    },
  },
});

export const { setStatus, setConsultationData, setError, resetConsultation } = consultationSlice.actions;
export default consultationSlice.reducer;