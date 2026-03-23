import { Request, Response, NextFunction } from "express";
import { jobService } from "../services/job.service";
import { AuthRequest, Role } from "../types/auth.types";
import { CreateJobDTO, UpdateJobDTO, JobQuery } from "../types/job.types";

export class JobController {

  // ── POST /jobs ────────────────────────────────────────────────────────────
  createJob = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: CreateJobDTO = req.body;
      const job = await jobService.createJob(dto, req.user!.userId);

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data:    { job },
      });
    } catch (err) { next(err); }
  };

  // ── GET /jobs ─────────────────────────────────────────────────────────────
  getAllJobs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await jobService.getAllJobs(req.query as JobQuery);
      res.status(200).json({ success: true, message: "Jobs fetched successfully", ...result });
    } catch (err) { next(err); }
  };

  // ── GET /jobs/:id ─────────────────────────────────────────────────────────
  getJobById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const job = await jobService.getJobById(req.params.id);
      res.status(200).json({ success: true, data: { job } });
    } catch (err) { next(err); }
  };

  // ── PATCH /jobs/:id ───────────────────────────────────────────────────────
  updateJob = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: UpdateJobDTO = req.body;
      const isAdmin           = req.user!.role === Role.ADMIN;

      const job = await jobService.updateJob(
        req.params.id,
        dto,
        req.user!.userId,
        isAdmin
      );

      res.status(200).json({
        success: true,
        message: "Job updated successfully",
        data:    { job },
      });
    } catch (err) { next(err); }
  };

  // ── DELETE /jobs/:id ──────────────────────────────────────────────────────
  deleteJob = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdmin = req.user!.role === Role.ADMIN;

      await jobService.deleteJob(req.params.id, req.user!.userId, isAdmin);

      res.status(200).json({ success: true, message: "Job deleted successfully" });
    } catch (err) { next(err); }
  };
}

export const jobController = new JobController();