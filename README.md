# ScholarSync: Resume & Academic Integration

ScholarSync is a Next.js application that helps users combine their professional resume data with their academic profiles from Google Scholar. The app parses resume files, extracts data from Google Scholar, and generates relevant project suggestions based on skills and research interests.

## Features

- Resume upload and parsing (PDF/DOCX)
- Google Scholar profile integration
- Project recommendations based on skills and academic interests
- Responsive design with Tailwind CSS
- Secure file processing with validation

## Tech Stack

- **Frontend**: Next.js, React, Redux Toolkit, Tailwind CSS
- **Backend**: Next.js API routes
- **Resume Parsing**: pdf-parse, mammoth.js
- **Web Scraping**: Cheerio
- **Testing**: Jest, React Testing Library, Cypress

## Design Patterns

ScholarSync implements several design patterns for clean architecture:

1. **Observer Pattern**: Used in the Scholar scraper to notify about scraping events
2. **Strategy Pattern**: Applied in the recommendation engine to switch between different recommendation approaches
3. **Factory Pattern**: Used for creating appropriate resume parsers based on file type

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/jhapriyavart10/scholarsync-resume-integration.git
   cd scholarsync-resume-integration
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security Measures

- Input validation for all user inputs
- File size and type validation
- Rate limiting on API routes
- XSS protection through proper sanitization
- CSRF protection

## Testing

- **Unit Tests**: `npm test`
- **Integration Tests**: Included in the Jest test suite
- **E2E Tests**: `npm run cypress`


