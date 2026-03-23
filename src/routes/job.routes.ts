import { Router } from "express";
import { jobController }               from "../controllers/job.controller";
import { protect, recruiterOrAdmin }   from "../middleware/auth.middleware";
import { validate }                    from "../middleware/validate.middleware";
import {
  createJobRules,
  updateJobRules,
  objectIdRule,
  getJobsQueryRules,
} from "../middleware/job.validate";

const router = Router();

// ── Public routes (no auth required) ─────────────────────────────────────────
router.get("/",    getJobsQueryRules, validate, jobController.getAllJobs);
router.get("/:id", objectIdRule,      validate, jobController.getJobById);

// ── Protected routes ──────────────────────────────────────────────────────────

// RECRUITER or ADMIN → create job
router.post(
  "/",
  protect,
  recruiterOrAdmin,
  createJobRules,
  validate,
  jobController.createJob
);

// RECRUITER (owner) or ADMIN → update
router.patch(
  "/:id",
  protect,
  recruiterOrAdmin,
  objectIdRule,
  updateJobRules,
  validate,
  jobController.updateJob
);

// RECRUITER (owner) or ADMIN → delete
router.delete(
  "/:id",
  protect,
  recruiterOrAdmin,
  objectIdRule,
  validate,
  jobController.deleteJob
);

export default router;