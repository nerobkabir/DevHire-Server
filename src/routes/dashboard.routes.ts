import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { protect, adminOnly }  from "../middleware/auth.middleware";

const router = Router();

// All dashboard routes: login required + ADMIN only
router.use(protect, adminOnly);

// ── Overview stats
router.get("/stats",                dashboardController.getStats);

// ── Chart data
router.get("/chart-data/bar",       dashboardController.getBarChartData);
router.get("/chart-data/line",      dashboardController.getLineChartData);
router.get("/chart-data/pie",       dashboardController.getPieChartData);

// ── Recent activity
router.get("/recent-activity",      dashboardController.getRecentActivity);

export default router;