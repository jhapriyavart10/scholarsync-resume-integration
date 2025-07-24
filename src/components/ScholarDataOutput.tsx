import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const ScholarDataOutput: React.FC = () => {
  const { name, publications, citations, interests, loading } = useSelector(
    (state: RootState) => state.scholar as {
      name: string;
      publications: any[];
      citations: {
        total?: number;
        h_index?: number;
        i10_index?: number;
      };
      interests: string[];
      loading: boolean;
    }
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Scholar Data</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!name && publications.length === 0 && interests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Google Scholar Data</h2>
      
      {name && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
        </div>
      )}
      
      {citations && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-1">Citation Metrics</h3>
          <div className="grid grid-cols-3 gap-4 my-2">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Total Citations</p>
              <p className="text-2xl font-bold text-blue-700">{citations.total}</p>
            </div>
            {citations.h_index !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-500">h-index</p>
                <p className="text-2xl font-bold text-blue-700">{citations.h_index}</p>
              </div>
            )}
            {citations.i10_index !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-500">i10-index</p>
                <p className="text-2xl font-bold text-blue-700">{citations.i10_index}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {interests.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Research Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {publications.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Publications</h3>
          <div className="space-y-3">
            {publications.slice(0, 5).map((pub, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium">
                  {pub.url ? (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {pub.title}
                    </a>
                  ) : (
                    pub.title
                  )}
                </h4>
                <p className="text-sm text-gray-600">{pub.authors}</p>
                <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                  <span>{pub.journal} {pub.year && `(${pub.year})`}</span>
                  {pub.citations !== undefined && (
                    <span>Citations: {pub.citations}</span>
                  )}
                </div>
              </div>
            ))}
            
            {publications.length > 5 && (
              <p className="text-sm text-gray-500">
                Showing 5 of {publications.length} publications
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarDataOutput;
