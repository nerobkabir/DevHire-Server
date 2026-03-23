import { Schema, model } from "mongoose";
import { IJobDocument, JobCategory, JobStatus, JobType } from "../types/job.types";

const jobSchema = new Schema<IJobDocument>(
  {
    title: {
      type:      String,
      required:  [true, "Job title is required"],
      trim:      true,
      minlength: [3,   "Title must be at least 3 characters"],
      maxlength: [150, "Title must be at most 150 characters"],
    },

    description: {
      type:      String,
      required:  [true, "Job description is required"],
      trim:      true,
      minlength: [20,   "Description must be at least 20 characters"],
      maxlength: [5000, "Description must be at most 5000 characters"],
    },

    company: {
      type:      String,
      required:  [true, "Company name is required"],
      trim:      true,
      maxlength: [100, "Company name must be at most 100 characters"],
    },

    salary: {
      type:     Number,
      required: [true, "Salary is required"],
      min:      [0, "Salary must be a positive number"],
    },

    location: {
      type:      String,
      required:  [true, "Location is required"],
      trim:      true,
      maxlength: [100, "Location must be at most 100 characters"],
    },

    category: {
      type:     String,
      required: [true, "Category is required"],
      enum: {
        values:  Object.values(JobCategory),
        message: `Category must be one of: ${Object.values(JobCategory).join(", ")}`,
      },
    },

    jobType: {
      type:    String,
      enum: {
        values:  Object.values(JobType),
        message: `Job type must be one of: ${Object.values(JobType).join(", ")}`,
      },
      default: JobType.FULL_TIME,
    },

    requiredSkills: {
      type:     [String],
      required: [true, "Required skills are needed"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message:   "At least one skill is required",
      },
    },

    status: {
      type:    String,
      enum:    Object.values(JobStatus),
      default: JobStatus.OPEN,
    },

    createdBy: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Job creator is required"],
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

// ── Indexes ───────────────────────────────────────────────────────────────────
jobSchema.index({ title: "text", description: "text", category: "text" });
jobSchema.index({ category:  1 });
jobSchema.index({ location:  1 });
jobSchema.index({ salary:    1 });
jobSchema.index({ status:    1 });
jobSchema.index({ createdBy: 1 });
jobSchema.index({ createdAt: -1 });

export const Job = model<IJobDocument>("Job", jobSchema);