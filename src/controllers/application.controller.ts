import { Response, NextFunction } from "express";
import { applicationService } from "../services/application.service";
import { AuthRequest, Role }  from "../types/auth.types";
import {
  CreateApplicationDTO,
  UpdateApplicationStatusDTO,
  ApplicationQuery,
} from "../types/application.types";

export class ApplicationController {

  // POST /applications  (USER only)
  applyForJob = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: CreateApplicationDTO = req.body;
      const application = await applicationService.applyForJob(dto, req.user!.userId);

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data:    { application },
      });
    } catch (err) { next(err); }
  };

  // GET /applications/my  (USER — own applications) 
  getMyApplications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await applicationService.getMyApplications(
        req.user!.userId,
        req.query as ApplicationQuery
      );

      res.status(200).json({
        success: true,
        message: "Applications fetched successfully",
        ...result,
      });
    } catch (err) { next(err); }
  };

  // GET /applications/job/:jobId  (RECRUITER owner or ADMIN) 
  getJobApplicants = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdmin = req.user!.role === Role.ADMIN;

      const result = await applicationService.getJobApplicants(
        req.params.jobId,
        req.user!.userId,
        isAdmin,
        req.query as ApplicationQuery
      );

      res.status(200).json({
        success: true,
        message: "Applicants fetched successfully",
        ...result,
      });
    } catch (err) { next(err); }
  };

  // GET /applications  (ADMIN only — all applications)
  getAllApplications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await applicationService.getAllApplications(
        req.query as ApplicationQuery
      );

      res.status(200).json({
        success: true,
        message: "All applications fetched successfully",
        ...result,
      });
    } catch (err) { next(err); }
  };

  // PATCH /applications/:id/status  (RECRUITER or ADMIN) 
  updateStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: UpdateApplicationStatusDTO = req.body;
      const isAdmin = req.user!.role === Role.ADMIN;

      const application = await applicationService.updateStatus(
        req.params.id,
        dto,
        req.user!.userId,
        isAdmin
      );

      res.status(200).json({
        success: true,
        message: "Application status updated",
        data:    { application },
      });
    } catch (err) { next(err); }
  };

  // DELETE /applications/:id  (USER withdraw or ADMIN)
  deleteApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const isAdmin = req.user!.role === Role.ADMIN;

      await applicationService.deleteApplication(
        req.params.id,
        req.user!.userId,
        isAdmin
      );

      res.status(200).json({ success: true, message: "Application withdrawn successfully" });
    } catch (err) { next(err); }
  };
}

export const applicationController = new ApplicationController();