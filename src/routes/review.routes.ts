import { Router } from "express";
import { reviewController }  from "../controllers/review.controller";
import { protect }           from "../middleware/auth.middleware";
import { validate }          from "../middleware/validate.middleware";
import {
  createReviewRules,
  updateReviewRules,
  objectIdRule,
  jobIdParamRule,
  reviewQueryRules,
} from "../middleware/review.validate";

const router = Router();

// ── Public: get all reviews for a job ─────────────────────────────────────────
router.get(
  "/job/:jobId",
  jobIdParamRule,
  reviewQueryRules,
  validate,
  reviewController.getJobReviews
);

// ── Protected routes ──────────────────────────────────────────────────────────

// USER: submit a review
router.post(
  "/",
  protect,
  createReviewRules,
  validate,
  reviewController.createReview
);

// USER: update own review
router.patch(
  "/:id",
  protect,
  objectIdRule,
  updateReviewRules,
  validate,
  reviewController.updateReview
);

// USER (own) or ADMIN: delete review
router.delete(
  "/:id",
  protect,
  objectIdRule,
  validate,
  reviewController.deleteReview
);

export default router;