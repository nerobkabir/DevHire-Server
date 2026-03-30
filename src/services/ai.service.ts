import { ai }     from "../config/ai.client";
import { Review }  from "../models/review.model";
import {
  ChatDTO,
  GenerateDescriptionDTO,
  ReviewSummaryDTO,
  ResumeAnalysisDTO,
  SearchAssistantDTO,
} from "../types/ai.types";

export class AiService {

  // ── 1. Chatbot ────────────────────────────────────────────────────────────
  async chat(dto: ChatDTO): Promise<{ reply: string }> {
    const history = (dto.history ?? []).map((msg) => ({
      role:  msg.role,
      parts: [{ text: msg.content }],
    }));

    const systemContext = `
You are DevHire AI — a helpful assistant for a developer hiring platform.
Help developers find jobs, give career advice, suggest skills, and answer tech industry questions.
Keep responses concise, friendly, and practical.
    `.trim();

    const message = history.length === 0
      ? `${systemContext}\n\nUser: ${dto.message}`
      : dto.message;

    const reply = await ai.chat(history, message);
    return { reply };
  }

  // ── 2. Search assistant ───────────────────────────────────────────────────
  async searchAssistant(dto: SearchAssistantDTO): Promise<{
    suggestion: string;
    keywords:   string[];
    categories: string[];
  }> {
    const prompt = `
You are a job search assistant for a developer hiring platform.
The user wants to search for: "${dto.query}"

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "suggestion": "A helpful tip for this job search in 1-2 sentences",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "categories": ["Category1", "Category2"]
}

Available categories: Frontend, Backend, Fullstack, DevOps, Mobile, Data, AI/ML, QA, Design, Other
    `.trim();

    const raw  = await ai.generate(prompt);
    const json = this.parseJSON(raw);

    return {
      suggestion: json.suggestion ?? "Try searching with specific skills or job titles.",
      keywords:   json.keywords   ?? [],
      categories: json.categories ?? [],
    };
  }

  // ── 3. Job description generator ─────────────────────────────────────────
  async generateDescription(dto: GenerateDescriptionDTO): Promise<{ description: string }> {
    const prompt = `
Write a professional job description for:

Job Title: ${dto.title}
Company: ${dto.company}
${dto.skills?.length ? `Required skills: ${dto.skills.join(", ")}` : ""}
${dto.location ? `Location: ${dto.location}` : ""}

- Clear, professional tone
- Include: role overview, 5 responsibilities, 5 requirements
- 200–300 words
- No markdown headers or bullet symbols, plain text only
    `.trim();

    const description = await ai.generate(prompt);
    return { description: description.trim() };
  }

  // ── 4. Review summarizer ──────────────────────────────────────────────────
  async summarizeReviews(dto: ReviewSummaryDTO): Promise<{
    summary:    string;
    sentiment:  "positive" | "neutral" | "negative";
    avgRating:  number;
    highlights: string[];
  }> {
    const reviews = await Review.find({ jobId: dto.jobId })
      .select("rating comment")
      .limit(50)
      .lean();

    if (reviews.length === 0) {
      throw Object.assign(new Error("No reviews found for this job"), { statusCode: 404 });
    }

    const avgRating = parseFloat(
      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    );

    const reviewsText = reviews
      .map((r, i) => `Review ${i + 1} (Rating: ${r.rating}/5): ${r.comment}`)
      .join("\n");

    const prompt = `
Analyze these job reviews and respond ONLY in this JSON format (no markdown):
{
  "summary": "2-3 sentence overall summary",
  "sentiment": "positive" or "neutral" or "negative",
  "highlights": ["key point 1", "key point 2", "key point 3"]
}

Reviews:
${reviewsText}
    `.trim();

    const raw  = await ai.generate(prompt);
    const json = this.parseJSON(raw);

    return {
      summary:    json.summary    ?? "No summary available.",
      sentiment:  json.sentiment  ?? "neutral",
      avgRating,
      highlights: json.highlights ?? [],
    };
  }

  // ── 5. Resume analyzer ────────────────────────────────────────────────────
  async analyzeResume(dto: ResumeAnalysisDTO): Promise<{
    skills:         string[];
    experience:     string;
    strengths:      string[];
    improvements:   string[];
    jobSuggestions: string[];
    overallScore:   number;
  }> {
    const prompt = `
You are an expert technical recruiter. Analyze this resume and respond ONLY in this JSON format (no markdown):
{
  "skills": ["skill1", "skill2"],
  "experience": "Brief experience summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "jobSuggestions": ["Job Title 1", "Job Title 2", "Job Title 3"],
  "overallScore": 75
}

${dto.jobTitle ? `Candidate is applying for: ${dto.jobTitle}` : "Analyze for general software developer roles."}
overallScore: 0-100 based on quality and relevance.

Resume:
${dto.resumeText}
    `.trim();

    const raw  = await ai.generate(prompt);
    const json = this.parseJSON(raw);

    return {
      skills:         json.skills         ?? [],
      experience:     json.experience     ?? "Unable to determine.",
      strengths:      json.strengths      ?? [],
      improvements:   json.improvements   ?? [],
      jobSuggestions: json.jobSuggestions ?? [],
      overallScore:   json.overallScore   ?? 0,
    };
  }

  // ── Helper ────────────────────────────────────────────────────────────────
  private parseJSON(raw: string): Record<string, any> {
    try {
      const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return {};
    }
  }
}

export const aiService = new AiService();