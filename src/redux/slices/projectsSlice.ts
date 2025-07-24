import { createSlice } from '@reduxjs/toolkit';
import { ProjectsState } from '@/types';
import { generateProjectSuggestions } from '../thunks/projectThunks';

const initialState: ProjectsState = {
  suggestions: [],
  loading: false,
  error: null,
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearSuggestions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateProjectSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateProjectSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload;
      })
      .addCase(generateProjectSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate project suggestions';
      });
  },
});

export const { clearSuggestions } = projectsSlice.actions;
export default projectsSlice.reducer;
