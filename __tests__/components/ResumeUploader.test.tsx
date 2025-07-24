import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ResumeUploader from '@/components/ResumeUploader';
import { setFile } from '@/redux/slices/resumeSlice';

const mockStore = configureStore([thunk]);

describe('ResumeUploader Component', () => {
  let store: any;
  
  beforeEach(() => {
    store = mockStore({
      resume: {
        file: null,
        loading: false,
        error: null,
      },
    });
    
    store.dispatch = jest.fn();
  });
  
  it('renders correctly', () => {
    render(
      <Provider store={store}>
        <ResumeUploader />
      </Provider>
    );
    
    expect(screen.getByText(/Upload Your Resume/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your resume/i)).toBeInTheDocument();
    expect(screen.getByText(/Parse Resume/i)).toBeDisabled();
  });
  
  it('shows file name when file is selected', () => {
    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    
    store = mockStore({
      resume: {
        file,
        loading: false,
        error: null,
      },
    });
    
    render(
      <Provider store={store}>
        <ResumeUploader />
      </Provider>
    );
    
    expect(screen.getByText(/Selected file: resume.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Parse Resume/i)).not.toBeDisabled();
  });
  
  it('shows loading state', () => {
    store = mockStore({
      resume: {
        file: new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' }),
        loading: true,
        error: null,
      },
    });
    
    render(
      <Provider store={store}>
        <ResumeUploader />
      </Provider>
    );
    
    expect(screen.getByText(/Parsing Resume.../i)).toBeInTheDocument();
    expect(screen.getByText(/Parsing Resume.../i)).toBeDisabled();
  });
  
  it('displays error message', () => {
    store = mockStore({
      resume: {
        file: null,
        loading: false,
        error: 'Failed to parse resume',
      },
    });
    
    render(
      <Provider store={store}>
        <ResumeUploader />
      </Provider>
    );
    
    expect(screen.getByText(/Failed to parse resume/i)).toBeInTheDocument();
  });
});
