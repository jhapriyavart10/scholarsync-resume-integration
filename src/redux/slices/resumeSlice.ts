import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResumeData } from '@/types';
import { parseResume } from '../thunks/resumeThunks';

const initialState: ResumeData = {
  name: undefined,
  contact: {},
  summary: undefined,
  education: [],
  experience: [],
  skills: [],
  loading: false,
  error: null,
  file: null,
};

export const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<File | null>) => {
      state.file = action.payload;
    },
    clearResumeData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(parseResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parseResume.fulfilled, (state, action: PayloadAction<Partial<ResumeData>>) => {
        return {
          ...state,
          ...action.payload,
          loading: false,
          error: null,
        };
      })
      .addCase(parseResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to parse resume';
      });
  },
});

export const { setFile, clearResumeData } = resumeSlice.actions;
export default resumeSlice.reducer;
