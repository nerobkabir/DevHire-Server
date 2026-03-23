import { Router } from "express";
import { applicationController }                 from "../controllers/application.controller";
import { protect, adminOnly, recruiterOrAdmin }  from "../middleware/auth.middleware";
import { validate }                              from "../middleware/validate.middleware";
import {
  applyRules,
  updateStatusRules,
  objectIdRule,
  jobIdParamRule,
  applicationQueryRules,
} from "../middleware/application.validate";

const router = Router();

// All routes require login
router.use(protect);

// ── USER: apply for a job
router.post(
  "/",
  applyRules,
  validate,
  applicationController.applyForJob
);

// ── USER: view own applications
router.get(
  "/my",
  applicationQueryRules,
  validate,
  applicationController.getMyApplications
);

// ── RECRUITER or ADMIN: view applicants for a specific job
router.get(
  "/job/:jobId",
  recruiterOrAdmin,
  jobIdParamRule,
  applicationQueryRules,
  validate,
  applicationController.getJobApplicants
);

// ── ADMIN: view all applications
router.get(
  "/",
  adminOnly,
  applicationQueryRules,
  validate,
  applicationController.getAllApplications
);

// ── RECRUITER or ADMIN: update application status
router.patch(
  "/:id/status",
  recruiterOrAdmin,
  objectIdRule,
  updateStatusRules,
  validate,
  applicationController.updateStatus
);

// ── USER: withdraw own application  |  ADMIN: delete any
router.delete(
  "/:id",
  objectIdRule,
  validate,
  applicationController.deleteApplication
);

export default router;