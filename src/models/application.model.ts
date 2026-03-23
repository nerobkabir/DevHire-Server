import { Schema, model } from "mongoose";
import { IApplicationDocument, ApplicationStatus } from "../types/application.types";

const applicationSchema = new Schema<IApplicationDocument>(
  {
    jobId: {
      type:     Schema.Types.ObjectId,
      ref:      "Job",
      required: [true, "Job ID is required"],
    },

    applicantId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Applicant ID is required"],
    },

    coverLetter: {
      type:      String,
      trim:      true,
      maxlength: [2000, "Cover letter must be at most 2000 characters"],
    },

    status: {
      type:    String,
      enum:    Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
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

// ── One user can apply to a job only once ─────────────────────────────────────
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ applicantId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });

export const Application = model<IApplicationDocument>("Application", applicationSchema);