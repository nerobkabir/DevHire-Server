import { Application } from "../models/application.model";
import { Job }         from "../models/job.model";
import {
  CreateApplicationDTO,
  UpdateApplicationStatusDTO,
  ApplicationQuery,
  IApplicationDocument,
} from "../types/application.types";

export class ApplicationService {

  // ── Apply for a job (USER only) ───────────────────────────────────────────
  async applyForJob(
    dto:         CreateApplicationDTO,
    applicantId: string
  ): Promise<IApplicationDocument> {
    // Check job exists and is open
    const job = await Job.findById(dto.jobId);
    if (!job) {
      throw Object.assign(new Error("Job not found"), { statusCode: 404 });
    }
    if (job.status !== "OPEN") {
      throw Object.assign(new Error("This job is no longer accepting applications"), { statusCode: 400 });
    }

    // Prevent duplicate application
    const existing = await Application.findOne({
      jobId:       dto.jobId,
      applicantId: applicantId,
    });
    if (existing) {
      throw Object.assign(new Error("You have already applied for this job"), { statusCode: 409 });
    }

    const application = await Application.create({
      jobId:       dto.jobId,
      applicantId: applicantId,
      coverLetter: dto.coverLetter,
    });

    return application.populate([
      { path: "jobId",       select: "title company location" },
      { path: "applicantId", select: "name email" },
    ]);
  }

  // ── Get my applications (USER) ────────────────────────────────────────────
  async getMyApplications(applicantId: string, query: ApplicationQuery) {
    const page  = Math.max(1, parseInt(query.page  ?? "1"));
    const limit = Math.min(50, parseInt(query.limit ?? "10"));
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = { applicantId };
    if (query.status) filter.status = query.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("jobId", "title company location salary"),
      Application.countDocuments(filter),
    ]);

    return {
      data: applications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Get applicants for a job (RECRUITER or ADMIN) ─────────────────────────
  async getJobApplicants(
    jobId:       string,
    requesterId: string,
    isAdmin:     boolean,
    query:       ApplicationQuery
  ) {
    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      throw Object.assign(new Error("Job not found"), { statusCode: 404 });
    }

    // Recruiter can only see applicants for their own jobs
    if (!isAdmin && job.createdBy.toString() !== requesterId) {
      throw Object.assign(
        new Error("You can only view applicants for your own jobs"),
        { statusCode: 403 }
      );
    }

    const page  = Math.max(1, parseInt(query.page  ?? "1"));
    const limit = Math.min(50, parseInt(query.limit ?? "10"));
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = { jobId };
    if (query.status) filter.status = query.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("applicantId", "name email bio skills github avatar"),
      Application.countDocuments(filter),
    ]);

    return {
      data: applications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Get all applications (ADMIN only) ─────────────────────────────────────
  async getAllApplications(query: ApplicationQuery) {
    const page  = Math.max(1, parseInt(query.page  ?? "1"));
    const limit = Math.min(50, parseInt(query.limit ?? "10"));
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("jobId",       "title company")
        .populate("applicantId", "name email"),
      Application.countDocuments(filter),
    ]);

    return {
      data: applications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Update application status (RECRUITER or ADMIN) ────────────────────────
  async updateStatus(
    applicationId: string,
    dto:           UpdateApplicationStatusDTO,
    requesterId:   string,
    isAdmin:       boolean
  ): Promise<IApplicationDocument> {
    const application = await Application.findById(applicationId).populate("jobId");
    if (!application) {
      throw Object.assign(new Error("Application not found"), { statusCode: 404 });
    }

    // Recruiter can only update status for their own job's applications
    const job = application.jobId as any;
    if (!isAdmin && job.createdBy?.toString() !== requesterId) {
      throw Object.assign(
        new Error("You can only manage applications for your own jobs"),
        { statusCode: 403 }
      );
    }

    application.status = dto.status;
    await application.save();

    return application;
  }

  // ── Delete / withdraw application (USER own or ADMIN) ─────────────────────
  async deleteApplication(
    applicationId: string,
    requesterId:   string,
    isAdmin:       boolean
  ): Promise<void> {
    const application = await Application.findById(applicationId);
    if (!application) {
      throw Object.assign(new Error("Application not found"), { statusCode: 404 });
    }

    if (!isAdmin && application.applicantId.toString() !== requesterId) {
      throw Object.assign(
        new Error("You can only withdraw your own application"),
        { statusCode: 403 }
      );
    }

    await application.deleteOne();
  }
}

export const applicationService = new ApplicationService();