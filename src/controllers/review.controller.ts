import { Request, Response, NextFunction } from "express";
import { reviewService }     from "../services/review.service";
import { AuthRequest, Role } from "../types/auth.types";
import {
  CreateReviewDTO,
  UpdateReviewDTO,
  ReviewQuery,
} from "../types/review.types";

export class ReviewController {

  // ── POST /reviews  (USER only) ────────────────────────────────────────────
  createReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: CreateReviewDTO = req.body;
      const review = await reviewService.createReview(dto, req.user!.userId);

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data:    { review },
      });
    } catch (err) { next(err); }
  };

  // ── GET /reviews/job/:jobId  (public) ─────────────────────────────────────
  getJobReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await reviewService.getJobReviews(
        req.params.jobId,
        req.query as ReviewQuery
      );

      res.status(200).json({
        success: true,
        message: "Reviews fetched successfully",
        ...result,
      });
    } catch (err) { next(err); }
  };

  // ── PATCH /reviews/:id  (own review) ─────────────────────────────────────
  updateReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: UpdateReviewDTO = req.body;
      const review = await reviewService.updateReview(
        req.params.id,
        dto,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data:    { review },
      });
    } catch (err) { next(err); }
  };

  // ── DELETE /reviews/:id  (own or ADMIN) ───────────────────────────────────
  deleteReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdmin = req.user!.role === Role.ADMIN;

      await reviewService.deleteReview(
        req.params.id,
        req.user!.userId,
        isAdmin
      );

      res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (err) { next(err); }
  };
}

export const reviewController = new ReviewController();