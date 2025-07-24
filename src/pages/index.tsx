import React from 'react';
import Layout from '@/components/Layout';
import ResumeUploader from '@/components/ResumeUploader';
import ScholarProfileInput from '@/components/ScholarProfileInput';
import ResumeParsingOutput from '@/components/ResumeParsingOutput';
import ScholarDataOutput from '@/components/ScholarDataOutput';
import ProjectSuggestions from '@/components/ProjectSuggestions';

const Home: React.FC = () => {
  return (
    <Layout title="ScholarSync - Home">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ResumeUploader />
        <ScholarProfileInput />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ResumeParsingOutput />
        <ScholarDataOutput />
      </div>

      <div className="mt-8">
        <ProjectSuggestions />
      </div>
    </Layout>
  );
};

export default Home;
