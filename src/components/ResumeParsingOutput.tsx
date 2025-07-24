import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const ResumeParsingOutput: React.FC = () => {
  const { name, contact, summary, education, experience, skills, loading } = useSelector(
    (state: RootState) => state.resume
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Resume Data</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!name && skills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Parsed Resume Data</h2>
      
      {name && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
          
          <div className="text-gray-600">
            {contact.email && <p>Email: {contact.email}</p>}
            {contact.phone && <p>Phone: {contact.phone}</p>}
            {contact.location && <p>Location: {contact.location}</p>}
            {contact.linkedin && (
              <p>
                LinkedIn:{' '}
                <a href={contact.linkedin} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                  {contact.linkedin}
                </a>
              </p>
            )}
          </div>
        </div>
      )}
      
      {summary && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-1">Summary</h3>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}
      
      {skills.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {education.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
              <p className="font-medium">{edu.institution}</p>
              <p className="text-sm text-gray-700">
                {edu.degree} in {edu.field}
                {edu.startDate && edu.endDate && (
                  <span> • {edu.startDate} - {edu.endDate}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {experience.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Work Experience</h3>
          {experience.map((exp, index) => (
            <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
              <p className="font-medium">{exp.company}</p>
              <p className="text-sm text-gray-700">
                {exp.position}
                {exp.startDate && exp.endDate && (
                  <span> • {exp.startDate} - {exp.endDate}</span>
                )}
              </p>
              {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeParsingOutput;
