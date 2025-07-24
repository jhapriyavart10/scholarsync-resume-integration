import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScholarData } from '@/types';
import { fetchScholarData } from '@/redux/thunks/scholarThunks';

const initialState: ScholarData = {
  profileUrl: '',
  publications: [],
  interests: [],
  loading: false,
  error: null,
};

export const scholarSlice = createSlice({
  name: 'scholar',
  initialState,
  reducers: {
    setProfileUrl: (state, action: PayloadAction<string>) => {
      state.profileUrl = action.payload;
    },
    clearScholarData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScholarData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScholarData.fulfilled, (state, action: PayloadAction<Partial<ScholarData>>) => {
        return {
          ...state,
          ...action.payload,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchScholarData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch scholar data';
      });
  },
});

export const { setProfileUrl, clearScholarData } = scholarSlice.actions;
export default scholarSlice.reducer;
