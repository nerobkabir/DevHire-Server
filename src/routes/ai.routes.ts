import { Router } from "express";
import { aiController }     from "../controllers/ai.controller";
import { protect }          from "../middleware/auth.middleware";
import { validate }         from "../middleware/validate.middleware";
import {
  chatRules,
  searchAssistantRules,
  generateDescriptionRules,
  reviewSummaryRules,
  resumeAnalysisRules,
} from "../middleware/ai.validate";

const router = Router();

// All AI routes require login
router.use(protect);

// ── Chatbot: job suggestions & career advice
router.post(
  "/chat",
  chatRules,
  validate,
  aiController.chat
);

// ── Search assistant: smart keyword + category suggestions
router.post(
  "/search-assistant",
  searchAssistantRules,
  validate,
  aiController.searchAssistant
);

// ── Generate job description (RECRUITER / ADMIN)
router.post(
  "/generate-description",
  generateDescriptionRules,
  validate,
  aiController.generateDescription
);

// ── Summarize reviews for a job
router.post(
  "/review-summary",
  reviewSummaryRules,
  validate,
  aiController.summarizeReviews
);

// ── Analyze resume
router.post(
  "/analyze-resume",
  resumeAnalysisRules,
  validate,
  aiController.analyzeResume
);

export default router;