import { body, param, query } from "express-validator";
import { Role } from "../types/auth.types";

// ── Update profile ────────────────────────────────────────────────────────────
export const updateProfileRules = [
  body("name")
    .optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),

  body("email")
    .optional().trim()
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("bio")
    .optional().trim()
    .isLength({ max: 500 }).withMessage("Bio must be at most 500 characters"),

  body("skills")
    .optional()
    .isArray().withMessage("Skills must be an array")
    .custom((arr: unknown[]) =>
      arr.every((s) => typeof s === "string" && s.trim().length > 0)
    ).withMessage("Each skill must be a non-empty string"),

  body("github")
    .optional().trim()
    .matches(/^https?:\/\/(www\.)?github\.com\/.+/)
    .withMessage("Please enter a valid GitHub URL (e.g. https://github.com/username)"),

  body("avatar")
    .optional().trim()
    .isURL().withMessage("Please enter a valid avatar URL"),

  // Block unknown fields
  body().custom((_, { req }) => {
    const allowed = ["name", "email", "bio", "skills", "github", "avatar"];
    const invalid = Object.keys(req.body).filter((k) => !allowed.includes(k));
    if (invalid.length) throw new Error(`Invalid fields: ${invalid.join(", ")}`);
    return true;
  }),
];

// ── Change role ───────────────────────────────────────────────────────────────
export const changeRoleRules = [
  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}`),
];

// ── Param: MongoDB ObjectId ───────────────────────────────────────────────────
export const objectIdRule = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];

// ── Query params for GET /users ───────────────────────────────────────────────
export const getUsersQueryRules = [
  query("page")
    .optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),

  query("role")
    .optional()
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}`),
];