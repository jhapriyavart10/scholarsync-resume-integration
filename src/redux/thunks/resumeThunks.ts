import { createAsyncThunk } from '@reduxjs/toolkit';
import { ResumeData } from '@/types';
import axios from 'axios';

export const parseResume = createAsyncThunk<Partial<ResumeData>, File>(
  'resume/parse',
  async (file) => {
    const formData = new FormData();
    formData.append('resumeFile', file);
    
    const response = await axios.post('/api/parse-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
);
