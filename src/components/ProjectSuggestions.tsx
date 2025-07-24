import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { generateProjectSuggestions } from '@/redux/thunks/projectThunks';
import { AppDispatch } from '@/redux/store';

interface RelatedPublication {
  title: string;
  // Add other fields if needed, e.g. authors, year, etc.
}

const ProjectSuggestions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { suggestions, loading, error } = useSelector((state: RootState) => state.projects as {
    suggestions: any[];
    loading: boolean;
    error: string | null;
  });
  const resumeData = useSelector((state: RootState) => state.resume);
  const scholarData = useSelector((state: RootState) => state.scholar) as {
    publications: any[];
    interests: any[];
  };
  
  const hasResumeData = resumeData.skills.length > 0;
  const hasScholarData = scholarData.publications.length > 0 || scholarData.interests.length > 0;
  
  const handleGenerateSuggestions = () => {
    dispatch(generateProjectSuggestions());
  };
  
  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasResumeData && !hasScholarData) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Project Suggestions</h2>
      
      {!suggestions.length && !loading && (
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Generate project suggestions based on your resume skills and academic interests.
          </p>
          
          <button
            onClick={handleGenerateSuggestions}
            disabled={loading || !hasResumeData}
            className={`w-full py-2 px-4 rounded font-medium ${
              loading || !hasResumeData
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generating Suggestions...' : 'Generate Project Suggestions'}
          </button>
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="space-y-6">
          {suggestions.map((project) => (
            <div key={project.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <div className="flex items-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${difficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{project.category}</span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-gray-700 mb-4">{project.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Relevant Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {project.relatedPublications && project.relatedPublications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Related Publications</h4>
                    <ul className="space-y-1 text-sm">
                      {project.relatedPublications.map((pub: RelatedPublication, index: number) => (
                        <li key={index} className="text-gray-700">
                          {pub.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSuggestions;
