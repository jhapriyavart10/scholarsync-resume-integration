import { createAsyncThunk } from '@reduxjs/toolkit';
import { Project, ResumeData, ScholarData } from '@/types';
import axios from 'axios';
import { RootState } from '../store';

export const generateProjectSuggestions = createAsyncThunk<
  Project[],
  void,
  { state: RootState }
>('projects/generate', async (_, { getState }) => {
  const state = getState();
  const resumeData = state.resume;
  const scholarData = state.scholar;
  
  // Make sure we have data to work with
  if (!resumeData.skills.length) {
    throw new Error('Resume skills are required for project suggestions');
  }
  
  const response = await axios.post('/api/generate-suggestions', {
    resumeData,
    scholarData,
  });
  
  return response.data;
});
