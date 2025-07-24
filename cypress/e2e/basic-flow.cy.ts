// Import cypress-file-upload for attachFile command
import 'cypress-file-upload';

// Type declaration for attachFile command
declare global {
  namespace Cypress {
    interface Chainable {
      attachFile(file: any, options?: any): Chainable<JQuery<HTMLElement>>;
    }
  }
}

describe('ScholarSync Basic Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // Stub API responses
    cy.intercept('POST', '/api/parse-resume', {
      statusCode: 200,
      body: {
        name: 'John Doe',
        contact: { email: 'john@example.com' },
        skills: ['JavaScript', 'React', 'Node.js'],
        education: [{ institution: 'Example University', degree: 'PhD', field: 'Computer Science' }],
        experience: []
      }
    }).as('parseResume');
    
    cy.intercept('POST', '/api/fetch-scholar-data', {
      statusCode: 200,
      body: {
        name: 'John Doe, PhD',
        publications: [{ 
          title: 'Example Research Paper', 
          authors: 'Doe, J., Smith, A.', 
          year: '2023',
          citations: 10
        }],
        interests: ['Machine Learning', 'Data Science']
      }
    }).as('fetchScholar');
    
    cy.intercept('POST', '/api/generate-suggestions', {
      statusCode: 200,
      body: [{
        id: '1',
        title: 'Research Visualization Tool',
        description: 'Create an interactive visualization tool for research data',
        category: 'Data Visualization',
        skills: ['JavaScript', 'D3.js'],
        difficulty: 'Intermediate'
      }]
    }).as('getSuggestions');
  });

  it('should complete the full flow', () => {
    // Check if main components are rendered
    cy.contains('h1', 'ScholarSync').should('be.visible');
    cy.contains('h2', 'Upload Your Resume').should('be.visible');
    cy.contains('h2', 'Google Scholar Profile').should('be.visible');
    
    // Test file upload
    cy.get('input[type=file]').attachFile({
      fileContent: 'dummy resume content',
      fileName: 'resume.pdf',
      mimeType: 'application/pdf'
    });
    
    cy.contains('Parse Resume').click();
    cy.wait('@parseResume');
    
    // Check if resume data is displayed
    cy.contains('John Doe').should('be.visible');
    cy.contains('Example University').should('be.visible');
    
    // Test scholar profile input
    cy.get('#scholarUrl').type('https://scholar.google.com/citations?user=abc123');
    cy.contains('Fetch Scholar Data').click();
    cy.wait('@fetchScholar');
    
    // Check if scholar data is displayed
    cy.contains('John Doe, PhD').should('be.visible');
    cy.contains('Example Research Paper').should('be.visible');
    
    // Test project suggestions generation
    cy.contains('Generate Project Suggestions').click();
    cy.wait('@getSuggestions');
    
    // Check if suggestions are displayed
    cy.contains('Research Visualization Tool').should('be.visible');
  });
});
