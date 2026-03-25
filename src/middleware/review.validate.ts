import { body, param, query } from "express-validator";

// ── Create review
export const createReviewRules = [
  body("jobId")
    .notEmpty().withMessage("Job ID is required")
    .isMongoId().withMessage("Invalid Job ID"),

  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("comment")
    .trim()
    .notEmpty().withMessage("Comment is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be 10–1000 characters"),
];

// ── Update review 
export const updateReviewRules = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be 10–1000 characters"),
];

// ── Params 
export const objectIdRule = [
  param("id").isMongoId().withMessage("Invalid review ID"),
];

export const jobIdParamRule = [
  param("jobId").isMongoId().withMessage("Invalid job ID"),
];

// ── Query 
export const reviewQueryRules = [
  query("page")
    .optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1–50"),
];