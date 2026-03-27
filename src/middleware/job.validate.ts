import { body, param, query } from "express-validator";
import { JobCategory, JobStatus, JobType } from "../types/job.types";

// ── Create job ─────────────────────────────────────────────────────────────────
export const createJobRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 150 }).withMessage("Title must be 3–150 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 20, max: 5000 }).withMessage("Description must be 20–5000 characters"),

  body("company")
    .trim()
    .notEmpty().withMessage("Company name is required")
    .isLength({ max: 100 }).withMessage("Company name must be at most 100 characters"),

  body("salary")
    .notEmpty().withMessage("Salary is required")
    .isNumeric().withMessage("Salary must be a number")
    .custom((v) => Number(v) >= 0).withMessage("Salary must be positive"),

  body("location")
    .trim()
    .notEmpty().withMessage("Location is required"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(Object.values(JobCategory))
    .withMessage(`Category must be one of: ${Object.values(JobCategory).join(", ")}`),

  body("jobType")
    .optional()
    .isIn(Object.values(JobType))
    .withMessage(`Job type must be one of: ${Object.values(JobType).join(", ")}`),

  body("requiredSkills")
    .isArray({ min: 1 }).withMessage("At least one required skill must be provided")
    .custom((arr: unknown[]) =>
      arr.every((s) => typeof s === "string" && s.trim().length > 0)
    ).withMessage("Each skill must be a non-empty string"),
];

// ── Update job ─────────────────────────────────────────────────────────────────
export const updateJobRules = [
  body("title")
    .optional().trim()
    .isLength({ min: 3, max: 150 }).withMessage("Title must be 3–150 characters"),

  body("description")
    .optional().trim()
    .isLength({ min: 20, max: 5000 }).withMessage("Description must be 20–5000 characters"),

  body("salary")
    .optional()
    .isNumeric().withMessage("Salary must be a number")
    .custom((v) => Number(v) >= 0).withMessage("Salary must be positive"),

  body("category")
    .optional()
    .isIn(Object.values(JobCategory))
    .withMessage(`Category must be one of: ${Object.values(JobCategory).join(", ")}`),

  body("jobType")
    .optional()
    .isIn(Object.values(JobType))
    .withMessage(`Job type must be one of: ${Object.values(JobType).join(", ")}`),

  body("status")
    .optional()
    .isIn(Object.values(JobStatus))
    .withMessage(`Status must be one of: ${Object.values(JobStatus).join(", ")}`),

  body("requiredSkills")
    .optional()
    .isArray({ min: 1 }).withMessage("At least one skill is required")
    .custom((arr: unknown[]) =>
      arr.every((s) => typeof s === "string" && s.trim().length > 0)
    ).withMessage("Each skill must be a non-empty string"),
];

// ── Param: MongoDB ObjectId ────────────────────────────────────────────────────
export const objectIdRule = [
  param("id").isMongoId().withMessage("Invalid job ID"),
];

// ── Query params ───────────────────────────────────────────────────────────────
export const getJobsQueryRules = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage("Limit must be 1–200"),  // ← 50 থেকে 200 করা হয়েছে

  query("salaryMin")
    .optional()
    .isNumeric().withMessage("salaryMin must be a number"),

  query("salaryMax")
    .optional()
    .isNumeric().withMessage("salaryMax must be a number"),

  query("category")
    .optional()
    .isIn(Object.values(JobCategory))
    .withMessage(`Category must be one of: ${Object.values(JobCategory).join(", ")}`),

  query("jobType")
    .optional()
    .isIn(Object.values(JobType))
    .withMessage(`Job type must be one of: ${Object.values(JobType).join(", ")}`),

  query("sort")
    .optional()
    .isIn(["salary", "-salary", "createdAt", "-createdAt"])
    .withMessage("Sort must be: salary, -salary, createdAt, or -createdAt"),
];