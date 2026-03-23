import { Review } from "../models/review.model";
import { Job }    from "../models/job.model";
import {
  CreateReviewDTO,
  UpdateReviewDTO,
  ReviewQuery,
  IReviewDocument,
} from "../types/review.types";

export class ReviewService {

  // ── Create review (USER only) ─────────────────────────────────────────────
  async createReview(
    dto:    CreateReviewDTO,
    userId: string
  ): Promise<IReviewDocument> {
    // Check job exists
    const job = await Job.findById(dto.jobId);
    if (!job) {
      throw Object.assign(new Error("Job not found"), { statusCode: 404 });
    }

    // One review per user per job
    const existing = await Review.findOne({ jobId: dto.jobId, userId });
    if (existing) {
      throw Object.assign(
        new Error("You have already reviewed this job"),
        { statusCode: 409 }
      );
    }

    const review = await Review.create({ ...dto, userId });

    return review.populate("userId", "name avatar");
  }

  // ── Get all reviews for a job (public) ────────────────────────────────────
  async getJobReviews(jobId: string, query: ReviewQuery) {
    const job = await Job.findById(jobId);
    if (!job) {
      throw Object.assign(new Error("Job not found"), { statusCode: 404 });
    }

    const page  = Math.max(1, parseInt(query.page  ?? "1"));
    const limit = Math.min(50, parseInt(query.limit ?? "10"));
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ jobId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar"),
      Review.countDocuments({ jobId }),
    ]);

    // Calculate average rating
    const ratingData = await Review.aggregate([
      { $match: { jobId: job._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } },
    ]);

    const avgRating = ratingData[0]?.avgRating
      ? parseFloat(ratingData[0].avgRating.toFixed(1))
      : 0;

    return {
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), avgRating },
    };
  }

  // ── Update own review (USER only) ─────────────────────────────────────────
  async updateReview(
    reviewId: string,
    dto:      UpdateReviewDTO,
    userId:   string
  ): Promise<IReviewDocument> {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw Object.assign(new Error("Review not found"), { statusCode: 404 });
    }

    if (review.userId.toString() !== userId) {
      throw Object.assign(
        new Error("You can only update your own review"),
        { statusCode: 403 }
      );
    }

    if (dto.rating  !== undefined) review.rating  = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    await review.save();
    return review.populate("userId", "name avatar");
  }

  // ── Delete review (own or ADMIN) ──────────────────────────────────────────
  async deleteReview(
    reviewId:  string,
    userId:    string,
    isAdmin:   boolean
  ): Promise<void> {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw Object.assign(new Error("Review not found"), { statusCode: 404 });
    }

    if (!isAdmin && review.userId.toString() !== userId) {
      throw Object.assign(
        new Error("You can only delete your own review"),
        { statusCode: 403 }
      );
    }

    await review.deleteOne();
  }
}

export const reviewService = new ReviewService();