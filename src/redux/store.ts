import { configureStore } from '@reduxjs/toolkit';
import resumeReducer from './slices/resumeSlice';
import scholarReducer from './slices/scholarSlice';
import projectsReducer from './slices/projectsSlice';

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    scholar: scholarReducer,
    projects: projectsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore file objects which aren't serializable
        ignoredActions: ['resume/setFile'],
        ignoredPaths: ['resume.file'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
