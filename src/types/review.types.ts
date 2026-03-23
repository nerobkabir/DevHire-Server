import { Document, Types } from "mongoose";

// ── Interface ─────────────────────────────────────────────────────────────────
export interface IReview {
  jobId:     Types.ObjectId;
  userId:    Types.ObjectId;
  rating:    number;
  comment:   string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {
  _id: Types.ObjectId;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface CreateReviewDTO {
  jobId:   string;
  rating:  number;
  comment: string;
}

export interface UpdateReviewDTO {
  rating?:  number;
  comment?: string;
}

export interface ReviewQuery {
  page?:  string;
  limit?: string;
}