import { body, param, query } from "express-validator";
import { ApplicationStatus }  from "../types/application.types";

// ── Apply for job ─────────────────────────────────────────────────────────────
export const applyRules = [
  body("jobId")
    .notEmpty().withMessage("Job ID is required")
    .isMongoId().withMessage("Invalid Job ID"),

  body("coverLetter")
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage("Cover letter must be at most 2000 characters"),
];

// ── Update status ─────────────────────────────────────────────────────────────
export const updateStatusRules = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(Object.values(ApplicationStatus))
    .withMessage(
      `Status must be one of: ${Object.values(ApplicationStatus).join(", ")}`
    ),
];

// ── Param: ObjectId ───────────────────────────────────────────────────────────
export const objectIdRule = [
  param("id").isMongoId().withMessage("Invalid application ID"),
];

export const jobIdParamRule = [
  param("jobId").isMongoId().withMessage("Invalid job ID"),
];

// ── Query params ──────────────────────────────────────────────────────────────
export const applicationQueryRules = [
  query("page")
    .optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1–50"),

  query("status")
    .optional()
    .isIn(Object.values(ApplicationStatus))
    .withMessage(
      `Status must be one of: ${Object.values(ApplicationStatus).join(", ")}`
    ),
];