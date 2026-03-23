import { Schema, model } from "mongoose";
import { IReviewDocument } from "../types/review.types";

const reviewSchema = new Schema<IReviewDocument>(
  {
    jobId: {
      type:     Schema.Types.ObjectId,
      ref:      "Job",
      required: [true, "Job ID is required"],
    },

    userId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "User ID is required"],
    },

    rating: {
      type:     Number,
      required: [true, "Rating is required"],
      min:      [1, "Rating must be at least 1"],
      max:      [5, "Rating must be at most 5"],
    },

    comment: {
      type:      String,
      required:  [true, "Comment is required"],
      trim:      true,
      minlength: [10,   "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment must be at most 1000 characters"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// ── One user can review a job only once ───────────────────────────────────────
reviewSchema.index({ jobId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ jobId: 1 });
reviewSchema.index({ userId: 1 });

export const Review = model<IReviewDocument>("Review", reviewSchema);