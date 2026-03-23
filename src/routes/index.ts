import { Router } from "express";
import healthRouter      from "./health";
import authRouter        from "./auth.routes";
import userRouter        from "./user.routes";
import jobRouter         from "./job.routes";
import applicationRouter from "./application.routes";
import reviewRouter      from "./review.routes";
import dashboardRouter   from "./dashboard.routes";
import aiRouter          from "./ai.routes";           // ← নতুন

const router = Router();

router.use("/",             healthRouter);
router.use("/auth",         authRouter);
router.use("/users",        userRouter);
router.use("/jobs",         jobRouter);
router.use("/applications", applicationRouter);
router.use("/reviews",      reviewRouter);
router.use("/dashboard",    dashboardRouter);
router.use("/ai",           aiRouter);                 // ← নতুন

export default router;