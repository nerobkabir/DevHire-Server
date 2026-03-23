import { Job } from "../models/job.model";
import {
  CreateJobDTO,
  UpdateJobDTO,
  JobQuery,
  IJobDocument,
} from "../types/job.types";

export class JobService {

  // ── Create job ────────────────────────────────────────────────────────────
  async createJob(dto: CreateJobDTO, createdBy: string): Promise<IJobDocument> {
    const job = await Job.create({ ...dto, createdBy });
    return job;
  }

  // ── Get all jobs ──────────────────────────────────────────────────────────
  async getAllJobs(query: JobQuery) {
    const page  = Math.max(1, parseInt(query.page  ?? "1"));
    const limit = Math.min(50, parseInt(query.limit ?? "10"));
    const skip  = (page - 1) * limit;

    // ── Build filter ─────────────────────────────────────────────────────────
    const filter: Record<string, unknown> = { status: "OPEN" };

    if (query.search) {
      filter.$or = [
        { title:       { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
        { category:    { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.category) filter.category = query.category;
    if (query.location) filter.location = { $regex: query.location, $options: "i" };
    if (query.jobType)  filter.jobType  = query.jobType;

    if (query.salaryMin || query.salaryMax) {
      const salaryFilter: Record<string, number> = {};
      if (query.salaryMin) salaryFilter.$gte = parseInt(query.salaryMin);
      if (query.salaryMax) salaryFilter.$lte = parseInt(query.salaryMax);
      filter.salary = salaryFilter;
    }

    // ── Build sort ────────────────────────────────────────────────────────────
    const SORT_MAP: Record<string, Record<string, number>> = {
      "salary":     { salary:    1 },
      "-salary":    { salary:   -1 },
      "createdAt":  { createdAt: 1 },
      "-createdAt": { createdAt: -1 },
    };

    const sortObj = SORT_MAP[query.sort ?? "-createdAt"] ?? { createdAt: -1 };

    // ── Execute ───────────────────────────────────────────────────────────────
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email"),
      Job.countDocuments(filter),
    ]);

    return {
      data: jobs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Get single job ────────────────────────────────────────────────────────
  async getJobById(id: string): Promise<IJobDocument> {
    const job = await Job.findById(id).populate("createdBy", "name email");
    if (!job) {
      throw Object.assign(new Error("Job not found"), { statusCode: 404 });
    }
    return job;
  }

  // ── Update job ────────────────────────────────────────────────────────────
  async updateJob(
    jobId:       string,
    dto:         UpdateJobDTO,
    requesterId: string,
    isAdmin:     boolean
  ): Promise<IJobDocument> {
    const job = await Job.findById(jobId);
    if (!job) {
      throw Object.assign(new Error("Job not found"), { statusCode: 404 });
    }

    if (!isAdmin && job.createdBy.toString() !== requesterId) {
      throw Object.assign(
        new Error("You are not authorized to update this job"),
        { statusCode: 403 }
      );
    }

    const updated = await Job.findByIdAndUpdate(jobId, dto, {
      new:           true,
      runValidators: true,
    });

    return updated!;
  }

  // ── Delete job ────────────────────────────────────────────────────────────
  async deleteJob(
    jobId:       string,
    requesterId: string,
    isAdmin:     boolean
  ): Promise<void> {
    const job = await Job.findById(jobId);
    if (!job) {
      throw Object.assign(new Error("Job not found"), { statusCode: 404 });
    }

    if (!isAdmin && job.createdBy.toString() !== requesterId) {
      throw Object.assign(
        new Error("You are not authorized to delete this job"),
        { statusCode: 403 }
      );
    }

    await job.deleteOne();
  }
}

export const jobService = new JobService();