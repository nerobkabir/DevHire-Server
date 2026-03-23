import { Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";
import { AuthRequest }      from "../types/auth.types";

export class DashboardController {

  // ── GET /dashboard/stats ──────────────────────────────────────────────────
  getStats = async (
    _req: AuthRequest,
    res:  Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await dashboardService.getStats();
      res.status(200).json({
        success: true,
        message: "Dashboard stats fetched successfully",
        data,
      });
    } catch (err) { next(err); }
  };

  // ── GET /dashboard/chart-data/bar ─────────────────────────────────────────
  getBarChartData = async (
    _req: AuthRequest,
    res:  Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await dashboardService.getBarChartData();
      res.status(200).json({
        success: true,
        message: "Bar chart data fetched successfully",
        data,
      });
    } catch (err) { next(err); }
  };

  // ── GET /dashboard/chart-data/line ────────────────────────────────────────
  getLineChartData = async (
    _req: AuthRequest,
    res:  Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await dashboardService.getLineChartData();
      res.status(200).json({
        success: true,
        message: "Line chart data fetched successfully",
        data,
      });
    } catch (err) { next(err); }
  };

  // ── GET /dashboard/chart-data/pie ─────────────────────────────────────────
  getPieChartData = async (
    _req: AuthRequest,
    res:  Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await dashboardService.getPieChartData();
      res.status(200).json({
        success: true,
        message: "Pie chart data fetched successfully",
        data,
      });
    } catch (err) { next(err); }
  };

  // ── GET /dashboard/recent-activity ────────────────────────────────────────
  getRecentActivity = async (
    _req: AuthRequest,
    res:  Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await dashboardService.getRecentActivity();
      res.status(200).json({
        success: true,
        message: "Recent activity fetched successfully",
        data,
      });
    } catch (err) { next(err); }
  };
}

export const dashboardController = new DashboardController();