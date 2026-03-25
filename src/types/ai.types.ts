// ── Chat 
export interface ChatMessage {
  role:    "user" | "model";
  content: string;
}

export interface ChatDTO {
  message:  string;
  history?: ChatMessage[];
}

// ── Job description generator 
export interface GenerateDescriptionDTO {
  title:    string;
  company:  string;
  skills?:  string[];
  location?: string;
}

// ── Review summary 
export interface ReviewSummaryDTO {
  jobId: string;
}

// ── Resume analysis
export interface ResumeAnalysisDTO {
  resumeText: string;
  jobTitle?:  string;
}

// ── Search assistant 
export interface SearchAssistantDTO {
  query: string;
}