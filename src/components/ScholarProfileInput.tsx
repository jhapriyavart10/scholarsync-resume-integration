import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileUrl } from '@/redux/slices/scholarSlice';
import { fetchScholarData } from '@/redux/thunks/scholarThunks';
import { RootState } from '@/redux/store';
import { AppDispatch } from '@/redux/store';

const ScholarProfileInput: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [inputUrl, setInputUrl] = useState('');
  const { profileUrl, loading, error } = useSelector(
    (state: RootState) => state.scholar as {
      profileUrl: string;
      loading: boolean;
      error: string | null;
    }
  );

  const validateUrl = (url: string) => {
    // Basic validation for Google Scholar URL format
    const regex = /^https:\/\/scholar\.google\.(com|co\.[a-z]{2})\/citations\?user=.+$/i;
    return regex.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(inputUrl)) {
      alert('Please enter a valid Google Scholar profile URL');
      return;
    }
    dispatch(setProfileUrl(inputUrl));
    dispatch(fetchScholarData(inputUrl));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Google Scholar Profile</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="scholarUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Profile URL
          </label>
          <input
            type="url"
            id="scholarUrl"
            placeholder="https://scholar.google.com/citations?user=..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: https://scholar.google.com/citations?user=ABC123
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={!inputUrl || loading}
          className={`w-full py-2 px-4 rounded font-medium ${
            !inputUrl || loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Fetching Data...' : 'Fetch Scholar Data'}
        </button>
      </form>
      
      {profileUrl && !loading && !error && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          Profile data successfully fetched!
        </div>
      )}
    </div>
  );
};

export default ScholarProfileInput;
