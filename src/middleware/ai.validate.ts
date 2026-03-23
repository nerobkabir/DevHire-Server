import { body } from "express-validator";

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatRules = [
  body("message")
    .trim()
    .notEmpty().withMessage("Message is required")
    .isLength({ max: 1000 }).withMessage("Message must be at most 1000 characters"),

  body("history")
    .optional()
    .isArray().withMessage("History must be an array"),

  body("history.*.role")
    .optional()
    .isIn(["user", "model"]).withMessage("History role must be 'user' or 'model'"),

  body("history.*.content")
    .optional()
    .isString().withMessage("History content must be a string"),
];

// ── Search assistant ──────────────────────────────────────────────────────────
export const searchAssistantRules = [
  body("query")
    .trim()
    .notEmpty().withMessage("Search query is required")
    .isLength({ max: 300 }).withMessage("Query must be at most 300 characters"),
];

// ── Generate description ──────────────────────────────────────────────────────
export const generateDescriptionRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Job title is required")
    .isLength({ max: 100 }).withMessage("Title must be at most 100 characters"),

  body("company")
    .trim()
    .notEmpty().withMessage("Company name is required"),

  body("skills")
    .optional()
    .isArray().withMessage("Skills must be an array"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Location must be at most 100 characters"),
];

// ── Review summary ────────────────────────────────────────────────────────────
export const reviewSummaryRules = [
  body("jobId")
    .notEmpty().withMessage("Job ID is required")
    .isMongoId().withMessage("Invalid Job ID"),
];

// ── Resume analysis ───────────────────────────────────────────────────────────
export const resumeAnalysisRules = [
  body("resumeText")
    .trim()
    .notEmpty().withMessage("Resume text is required")
    .isLength({ min: 50, max: 5000 })
    .withMessage("Resume text must be 50–5000 characters"),

  body("jobTitle")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Job title must be at most 100 characters"),
];