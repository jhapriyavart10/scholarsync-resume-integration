import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { ResumeData } from '@/types';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Factory pattern for creating specific parsers
interface Parser {
  parse(buffer: Buffer): Promise<Partial<ResumeData>>;
}

class PdfParser implements Parser {
  async parse(buffer: Buffer): Promise<Partial<ResumeData>> {
    const pdfData = await pdfParse(buffer);
    return this.extractResumeData(pdfData.text);
  }
  
  public extractResumeData(text: string): Partial<ResumeData> {
    console.log("Extracted text from PDF:", text.substring(0, 500) + "..."); // Log beginning of text for debugging
    
    // Extract name (assume first line is name)
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const name = lines[0]?.trim();
    
    // Extract email using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : undefined;
    
    // Extract phone using regex - improved pattern
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?){1,2}\d{3,4}(-?\d{3,4})?/;
    const phoneMatch = text.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : undefined;
    
    // Extract skills - completely revamped approach
    const skills: string[] = [];
    
    // First, try to find a skills section with various patterns
    const skillsPatterns = [
      /SKILLS[\s\n]*[:•]?([\s\S]*?)(?=EDUCATION|EXPERIENCE|PROJECTS|ACHIEVEMENTS|LANGUAGES|\n\n)/i,
      /TECHNICAL[\s\n]*[:•]?([\s\S]*?)(?=EDUCATION|EXPERIENCE|PROJECTS|ACHIEVEMENTS|LANGUAGES|\n\n)/i,
      /TECHNICAL SKILLS[\s\n]*[:•]?([\s\S]*?)(?=EDUCATION|EXPERIENCE|PROJECTS|ACHIEVEMENTS|LANGUAGES|\n\n)/i
    ];
    
    let skillsText = '';
    for (const pattern of skillsPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        skillsText = match[1].trim();
        break;
      }
    }
    
    // If we found a skills section, parse it
    if (skillsText) {
      // Try various splitting patterns to extract individual skills
      let skillsList: string[] = [];
      
      // Try splitting by bullet points and similar characters
      if (skillsText.includes('•') || skillsText.includes('·') || skillsText.includes('-')) {
        skillsList = skillsText.split(/[•·\-]/).map(s => s.trim()).filter(s => s.length > 0);
      } 
      // Try splitting by commas
      else if (skillsText.includes(',')) {
        skillsList = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
      // Try splitting by newlines
      else {
        skillsList = skillsText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      }
      
      skills.push(...skillsList);
    }
    
    // If still no skills or only found "SKILLS" as a skill, try to find technical keywords throughout the resume
    if (skills.length === 0 || (skills.length === 1 && skills[0].toUpperCase() === 'SKILLS')) {
      const techKeywords = [
        'JavaScript', 'TypeScript', 'React', 'React.js', 'Node.js', 'HTML', 'CSS', 'Python',
        'Java', 'C++', 'C#', 'Ruby', 'PHP', 'SQL', 'NoSQL', 'MongoDB', 'Express',
        'Angular', 'Vue', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'REST', 'RESTful',
        'API', 'APIs', 'Redux', 'Context API', 'Tailwind', 'Bootstrap', 'Material UI',
        'Next.js', 'Gatsby', 'Webpack', 'Babel', 'SASS', 'SCSS', 'jQuery', 'GraphQL',
        'Firebase', 'Heroku', 'Netlify', 'Vercel', 'TensorFlow', 'PyTorch', 'Flask', 'Django'
      ];
      
      // Extract all words from the text
      const words = text.match(/\b[A-Za-z0-9.+_-]+\b/g) || [];
      
      // Find matches with tech keywords
      const foundKeywords = new Set<string>();
      for (const word of words) {
        for (const keyword of techKeywords) {
          if (word === keyword || word.toLowerCase() === keyword.toLowerCase()) {
            foundKeywords.add(keyword);
          }
        }
      }
      
      // Also look for multi-word tech terms
      const techPhrases = [
        'React.js', 'Node.js', 'Machine Learning', 'Deep Learning', 'Data Science',
        'Computer Vision', 'Natural Language Processing', 'Context API', 'Material UI',
        'REST API', 'RESTful API', 'Front End', 'Back End', 'Full Stack', 'Web Development'
      ];
      
      for (const phrase of techPhrases) {
        if (text.includes(phrase)) {
          foundKeywords.add(phrase);
        }
      }
      
      // Extract skills from work experience descriptions
      const expSection = text.match(/EXPERIENCE[\s\S]*?(?=EDUCATION|SKILLS|PROJECTS|ACHIEVEMENTS|$)/i);
      if (expSection && expSection[0]) {
        // Look for common skill patterns in experience descriptions
        const skillMatches = expSection[0].match(/using\s+([A-ZaZ0-9,.\s]+)(?=\s+to|\s*,|\s*\.)/ig) || [];
        for (const match of skillMatches) {
          const extractedSkills = match.replace(/using\s+/i, '')
            .split(/[,\s]+/)
            .map(s => s.trim())
            .filter(s => s.length > 2);
          
          for (const skill of extractedSkills) {
            if (skill && !['to', 'and', 'the', 'with'].includes(skill.toLowerCase())) {
              foundKeywords.add(skill);
            }
          }
        }
      }
      
      // Add found keywords to skills
      skills.length = 0; // Clear existing skills if they were just headers
      skills.push(...Array.from(foundKeywords));
    }
    
    // Extract education - improved pattern
    const education = [];
    
    // Various patterns for education section
    const eduSectionPatterns = [
      /EDUCATION[\s\n]*:?([\s\S]*?)(?=EXPERIENCE|SKILLS|PROJECTS|ACHIEVEMENTS|LANGUAGES|\n\n\n)/i,
      /ACADEMIC[\s\n]*:?([\s\S]*?)(?=EXPERIENCE|SKILLS|PROJECTS|ACHIEVEMENTS|LANGUAGES|\n\n\n)/i
    ];
    
    for (const pattern of eduSectionPatterns) {
      const eduMatch = text.match(pattern);
      if (eduMatch && eduMatch[1]) {
        const eduText = eduMatch[1].trim();
        
        // Split by double newline or bullet points
        const eduEntries = eduText.split(/\n\s*\n|\n\s*•/);
        
        for (const entry of eduEntries) {
          if (entry.trim().length === 0) continue;
          
          const lines = entry.split('\n').map(line => line.trim());
          
          // Look for institution name
          const institutionPattern = /(University|College|Institute|School|Academy|IIT)/i;
          const institutionLine = lines.find(line => institutionPattern.test(line)) || lines[0];
          
          // Look for degree
          const degreePattern = /(Bachelor|Master|PhD|B\.?Tech|M\.?Tech|B\.?E|M\.?E|B\.?S|M\.?S|B\.?A|M\.?A)/i;
          const degreeLine = lines.find(line => degreePattern.test(line));
          
          // Look for dates
          const datePattern = /(\d{4})\s*(-|–|to)\s*(\d{4}|Present|Current)/i;
          const dateLine = lines.find(line => datePattern.test(line));
          
          let startDate = '', endDate = '';
          if (dateLine) {
            const dateMatch = dateLine.match(datePattern);
            if (dateMatch) {
              startDate = dateMatch[1];
              endDate = dateMatch[3];
            }
          }
          
          education.push({
            institution: institutionLine || 'Unknown Institution',
            degree: degreeLine || lines[1] || 'Degree',
            field: lines.find(line => !line.includes(institutionLine || '') && !line.includes(degreeLine || '')) || 'Unknown Field',
            startDate,
            endDate
          });
        }
        
        break;
      }
    }
    
    // Extract work experience - improved pattern
    const experience = [];
    
    // Various patterns for experience section
    const expSectionPatterns = [
      /EXPERIENCE[\s\n]*:?([\s\S]*?)(?=EDUCATION|SKILLS|PROJECTS|ACHIEVEMENTS|LANGUAGES|\n\n\n)/i,
      /WORK EXPERIENCE[\s\n]*:?([\s\S]*?)(?=EDUCATION|SKILLS|PROJECTS|ACHIEVEMENTS|LANGUAGES|\n\n\n)/i,
      /PROFESSIONAL EXPERIENCE[\s\n]*:?([\s\S]*?)(?=EDUCATION|SKILLS|PROJECTS|ACHIEVEMENTS|LANGUAGES|\n\n\n)/i
    ];
    
    for (const pattern of expSectionPatterns) {
      const expMatch = text.match(pattern);
      if (expMatch && expMatch[1]) {
        const expText = expMatch[1].trim();
        
        // Split by double newline or bullet points to separate entries
        const expEntries = expText.split(/\n\s*\n|\n\s*•/);
        
        for (const entry of expEntries) {
          if (entry.trim().length === 0) continue;
          
          const lines = entry.split('\n').map(line => line.trim());
          
          if (lines.length < 2) continue;
          
          // Extract company and position
          const company = lines[0];
          const position = lines[1];
          
          // Look for dates
          const datePattern = /(\w+\s*\d{4})\s*(-|–|to)\s*(\w+\s*\d{4}|Present|Current)/i;
          const dateLine = lines.find(line => datePattern.test(line));
          
          let startDate = '', endDate = '';
          if (dateLine) {
            const dateMatch = dateLine.match(datePattern);
            if (dateMatch) {
              startDate = dateMatch[1];
              endDate = dateMatch[3];
            }
          }
          
          // Extract description - everything after position and date
          const descriptionStartIndex = lines.findIndex(line => 
            line !== company && line !== position && line !== dateLine);
          
          const description = descriptionStartIndex > 0 
            ? lines.slice(descriptionStartIndex).join(' ') 
            : '';
          
          experience.push({
            company,
            position,
            startDate,
            endDate,
            description
          });
        }
        
        break;
      }
    }
    
    return {
      name,
      contact: {
        email,
        phone,
      },
      skills,
      education,
      experience,
    };
  }
}

class DocxParser implements Parser {
  async parse(buffer: Buffer): Promise<Partial<ResumeData>> {
    const result = await mammoth.extractRawText({ buffer });
    return this.extractResumeData(result.value);
  }
  
  private extractResumeData(text: string): Partial<ResumeData> {
    // Use the same extraction logic as PDF for consistency
    const pdfParser = new PdfParser();
    return pdfParser.extractResumeData(text);
  }
}

class ResumeParserFactory {
  static createParser(fileType: string): Parser {
    if (fileType === 'application/pdf') {
      return new PdfParser();
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return new DocxParser();
    }
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const form = formidable({});
  
  try {
    const [fields, files] = await form.parse(req);
    const resumeFile = files.resumeFile?.[0];
    
    if (!resumeFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resumeFile.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type. Please upload PDF or DOCX files only.' });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(resumeFile.filepath);
    
    // Use the factory to create the appropriate parser
    const parser = ResumeParserFactory.createParser(resumeFile.mimetype || '');
    const resumeData = await parser.parse(fileBuffer);
    
    // Clean up the temporary file
    fs.unlinkSync(resumeFile.filepath);
    
    return res.status(200).json(resumeData);
    
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    return res.status(500).json({ error: `Failed to parse resume: ${error.message}` });
  }
}
