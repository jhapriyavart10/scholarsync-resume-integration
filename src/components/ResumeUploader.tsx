import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { setFile } from '@/redux/slices/resumeSlice';
import { parseResume } from '@/redux/thunks/resumeThunks';
import { RootState } from '@/redux/store';
import { AppDispatch } from '@/redux/store';

const ResumeUploader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { file, loading, error } = useSelector((state: RootState) => state.resume);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload a PDF or DOCX file');
        return;
      }
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }
      
      dispatch(setFile(selectedFile));
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
  });

  const handleSubmit = () => {
    if (file) {
      dispatch(parseResume(file));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Your Resume</h2>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed p-6 rounded-lg cursor-pointer mb-4 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center text-blue-500">Drop the file here...</p>
        ) : (
          <p className="text-center text-gray-500">
            Drag and drop your resume (PDF or DOCX), or click to select
          </p>
        )}
      </div>
      
      {file && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Selected file: {file.name}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded font-medium ${
          !file || loading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Parsing Resume...' : 'Parse Resume'}
      </button>
    </div>
  );
};

export default ResumeUploader;
