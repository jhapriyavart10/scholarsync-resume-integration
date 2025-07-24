import { createAsyncThunk } from '@reduxjs/toolkit';
import { ScholarData } from '@/types';
import axios from 'axios';

export const fetchScholarData = createAsyncThunk<Partial<ScholarData>, string>(
  'scholar/fetch',
  async (profileUrl) => {
    if (!profileUrl) {
      throw new Error('Profile URL is required');
    }
    
    const response = await axios.post('/api/fetch-scholar-data', { profileUrl });
    return response.data;
  }
);
