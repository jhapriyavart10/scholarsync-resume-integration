// Import or define types used in this file
import type { NextApiRequest, NextApiResponse } from 'next';
import { Project, ResumeData, ScholarData } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit } from '@/utils/rateLimit';

// Rate limiter: max 5 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 10, // Max 10 users per interval
});

// Strategy pattern for recommendation engines
interface RecommendationStrategy {
  generateSuggestions(resumeData: ResumeData, scholarData: ScholarData): Project[];
}

// Skills-based recommendation strategy
class SkillsBasedStrategy implements RecommendationStrategy {
  generateSuggestions(resumeData: ResumeData, scholarData: ScholarData): Project[] {
    const suggestions: Project[] = [];
    
    // Get unique skills from resume
    const skills = resumeData.skills || [];
    
    // Get research interests from scholar data
    const interests = scholarData.interests || [];
    
    // Generate projects based on skills
    if (skills.includes('Python') || skills.includes('Machine Learning')) {
      suggestions.push({
        id: uuidv4(),
        title: 'ML Research Paper Implementation',
        description: 'Implement algorithms from recent machine learning papers in your field of interest',
        category: 'Machine Learning',
        skills: ['Python', 'TensorFlow', 'PyTorch'],
        difficulty: 'Advanced',
      });
    }
    
    if (skills.includes('JavaScript') || skills.includes('Web Development') || 
        skills.includes('React') || skills.includes('React.js')) {
      suggestions.push({
        id: uuidv4(),
        title: 'Interactive Research Visualization Dashboard',
        description: 'Create a web app to visualize and explore research data from your field',
        category: 'Web Development',
        skills: ['JavaScript', 'React', 'D3.js'],
        difficulty: 'Intermediate',
      });
      
      // Add a Next.js project suggestion
      suggestions.push({
        id: uuidv4(),
        title: 'Academic Portfolio Website',
        description: 'Build a personal academic website to showcase your research, publications and projects',
        category: 'Web Development',
        skills: ['Next.js', 'React', 'Tailwind CSS'],
        difficulty: 'Intermediate',
      });
    }
    
    // More suggestions based on competitive programming/DSA skills
    if (skills.some(skill => 
        ['Competitive Programming', 'Data Structures', 'Algorithms', 'DSA', 'LeetCode', 'Codeforces']
        .includes(skill))) {
      suggestions.push({
        id: uuidv4(),
        title: 'Algorithm Visualization Platform',
        description: 'Create an interactive platform to visualize and explain complex algorithms and data structures',
        category: 'Educational Tech',
        skills: ['JavaScript', 'React', 'Data Structures', 'Algorithms'],
        difficulty: 'Intermediate',
      });
      
      suggestions.push({
        id: uuidv4(),
        title: 'Competitive Programming Training Tool',
        description: 'Develop a tool that helps users practice competitive programming with personalized problem recommendations',
        category: 'Educational Tech',
        skills: ['React', 'Node.js', 'Algorithms'],
        difficulty: 'Advanced',
      });
    }
    
    // Fallback suggestions if no specific skills match
    if (suggestions.length === 0) {
      suggestions.push({
        id: uuidv4(),
        title: 'Personal Technical Blog',
        description: 'Create a blog to document your technical learnings and projects',
        category: 'Web Development',
        skills: ['HTML', 'CSS', 'JavaScript', 'Content Creation'],
        difficulty: 'Beginner',
      });
    }
    
    return suggestions;
  }
}

// Publications-based recommendation strategy
class PublicationsBasedStrategy implements RecommendationStrategy {
  generateSuggestions(resumeData: ResumeData, scholarData: ScholarData): Project[] {
    const suggestions: Project[] = [];
    const publications = scholarData.publications || [];
    
    if (publications.length > 0) {
      // Extract keywords from publication titles
      const titleWords = publications
        .flatMap(pub => pub.title.toLowerCase().split(' '))
        .filter(word => word.length > 4) // Filter out short words
        .reduce((acc: {[key: string]: number}, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {});
      
      // Find most common keywords
      const topKeywords = Object.entries(titleWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
      
      // Generate project ideas based on publication topics
      suggestions.push({
        id: uuidv4(),
        title: 'Research Data Analysis Tool',
        description: `Build a specialized tool for analyzing data in your research area: ${topKeywords.join(', ')}`,
        category: 'Research',
        skills: ['Data Analysis', 'Python', 'Statistics'],
        relatedPublications: publications.slice(0, 2),
        difficulty: 'Advanced',
      });
    }
    
    return suggestions;
  }
}

// Hybrid recommendation strategy
class HybridStrategy implements RecommendationStrategy {
  generateSuggestions(resumeData: ResumeData, scholarData: ScholarData): Project[] {
    const skillsStrategy = new SkillsBasedStrategy();
    const pubsStrategy = new PublicationsBasedStrategy();
    
    // Get suggestions from both strategies
    const skillsSuggestions = skillsStrategy.generateSuggestions(resumeData, scholarData);
    const pubsSuggestions = pubsStrategy.generateSuggestions(resumeData, scholarData);
    
    // Combine and return unique suggestions
    return [...skillsSuggestions, ...pubsSuggestions];
  }
}

// Context class that uses the recommendation strategy
class RecommendationEngine {
  private strategy: RecommendationStrategy;
  
  constructor(strategy: RecommendationStrategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy: RecommendationStrategy) {
    this.strategy = strategy;
  }
  
  generateRecommendations(resumeData: ResumeData, scholarData: ScholarData): Project[] {
    return this.strategy.generateSuggestions(resumeData, scholarData);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Apply rate limiting
    await limiter.check(res, 5, 'suggestions_api');
    
    const { resumeData, scholarData } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }
    
    console.log('Generating suggestions for skills:', resumeData.skills);
    
    // Create recommendation engine with hybrid strategy
    const engine = new RecommendationEngine(new SkillsBasedStrategy());
    
    // Generate project suggestions
    const suggestions = engine.generateRecommendations(resumeData, scholarData || {});
    
    // Add some default suggestions if the list is too short
    if (suggestions.length < 2) {
      suggestions.push({
        id: uuidv4(),
        title: 'Personal Academic Website',
        description: 'Create a personal website to showcase your research, publications, and CV',
        category: 'Web Development',
        skills: ['HTML', 'CSS', 'JavaScript'],
        difficulty: 'Beginner',
      });
    }
    
    return res.status(200).json(suggestions);
    
  } catch (error: any) {
    console.error('Error generating project suggestions:', error);
    
    return res.status(500).json({ 
      error: 'Failed to generate suggestions',
      details: error.message
    });
  }
}

