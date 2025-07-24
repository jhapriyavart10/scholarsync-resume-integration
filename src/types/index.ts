// Resume related types
export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Contact {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

export interface ResumeData {
  name?: string;
  contact: Contact;
  summary?: string;
  education: Education[];
  experience: WorkExperience[];
  skills: string[];
  loading: boolean;
  error: string | null;
  file: File | null;
}

// Google Scholar related types
export interface Publication {
  title: string;
  authors: string;
  journal?: string;
  year?: string;
  citations?: number;
  url?: string;
}

export interface ScholarData {
  name?: string;
  profileUrl: string;
  publications: Publication[];
  citations?: {
    total: number;
    h_index?: number;
    i10_index?: number;
  };
  interests: string[];
  loading: boolean;
  error: string | null;
}

// Project suggestion types
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  relatedPublications?: Publication[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ProjectsState {
  suggestions: Project[];
  loading: boolean;
  error: string | null;
}
