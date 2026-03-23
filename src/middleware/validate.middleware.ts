import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { Role, PUBLIC_ROLES } from "../types/auth.types";

// ── Run validation ────────────────────────────────────────────────────────────
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors:  errors.array().map((e) => ({
        field:   e.type === "field" ? e.path : "unknown",
        message: e.msg,
      })),
    });
    return;
  }
  next();
};

// ── Register rules ────────────────────────────────────────────────────────────
export const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),

  // Only USER or RECRUITER allowed — ADMIN is blocked
  body("role")
    .optional()
    .isIn(PUBLIC_ROLES)
    .withMessage(`Role must be one of: ${PUBLIC_ROLES.join(", ")}`),
];

// ── Login rules ───────────────────────────────────────────────────────────────
export const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];