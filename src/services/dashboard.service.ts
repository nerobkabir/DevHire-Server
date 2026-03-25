import { User }        from "../models/user.model";
import { Job }         from "../models/job.model";
import { Application } from "../models/application.model";
import { Review }      from "../models/review.model";

export class DashboardService {

  // ── Overview stats 
  async getStats() {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalReviews,
      usersByRole,
      jobsByStatus,
      applicationsByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Review.countDocuments(),

      // Users grouped by role
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),

      // Jobs grouped by status
      Job.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Applications grouped by status
      Application.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totals: {
        users:        totalUsers,
        jobs:         totalJobs,
        applications: totalApplications,
        reviews:      totalReviews,
      },
      usersByRole:          this.toObject(usersByRole),
      jobsByStatus:         this.toObject(jobsByStatus),
      applicationsByStatus: this.toObject(applicationsByStatus),
    };
  }

  // ── Bar chart: jobs posted per month (last 6 months) 
  async getBarChartData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [jobsPerMonth, applicationsPerMonth, usersPerMonth] = await Promise.all([
      Job.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      Application.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    return {
      labels:   this.buildMonthLabels(6),
      datasets: {
        jobs:         this.fillMonthlyData(jobsPerMonth,         6),
        applications: this.fillMonthlyData(applicationsPerMonth, 6),
        users:        this.fillMonthlyData(usersPerMonth,        6),
      },
    };
  }

  // ── Line chart: daily new registrations (last 30 days)
  async getLineChartData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [dailyUsers, dailyJobs] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
              day:   { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      Job.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
              day:   { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),
    ]);

    return {
      labels:   this.buildDayLabels(30),
      datasets: {
        users: this.fillDailyData(dailyUsers, 30),
        jobs:  this.fillDailyData(dailyJobs,  30),
      },
    };
  }

  // ── Pie chart: jobs by category 
  async getPieChartData() {
    const [jobsByCategory, applicationsByStatus, usersByRole] = await Promise.all([
      Job.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
      ]),

      Application.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      jobsByCategory:       jobsByCategory.map((d) => ({ label: d._id, value: d.count })),
      applicationsByStatus: applicationsByStatus.map((d) => ({ label: d._id, value: d.count })),
      usersByRole:          usersByRole.map((d) => ({ label: d._id, value: d.count })),
    };
  }

  // ── Recent activity 
  async getRecentActivity() {
    const [recentUsers, recentJobs, recentApplications] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
      Job.find().sort({ createdAt: -1 }).limit(5)
        .select("title company category createdAt")
        .populate("createdBy", "name"),
      Application.find().sort({ createdAt: -1 }).limit(5)
        .populate("jobId",       "title company")
        .populate("applicantId", "name email"),
    ]);

    return { recentUsers, recentJobs, recentApplications };
  }

  // ── Helpers 
  private toObject(arr: { _id: string; count: number }[]) {
    return arr.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  private buildMonthLabels(count: number): string[] {
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const labels: string[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
    }
    return labels;
  }

  private buildDayLabels(count: number): string[] {
    const labels: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    return labels;
  }

  private fillMonthlyData(
    data: { _id: { year: number; month: number }; count: number }[],
    count: number
  ): number[] {
    const now    = new Date();
    const result = Array(count).fill(0);

    data.forEach(({ _id, count: val }) => {
      for (let i = 0; i < count; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
        if (d.getFullYear() === _id.year && d.getMonth() + 1 === _id.month) {
          result[i] = val;
        }
      }
    });

    return result;
  }

  private fillDailyData(
    data: { _id: { year: number; month: number; day: number }; count: number }[],
    count: number
  ): number[] {
    const result = Array(count).fill(0);

    data.forEach(({ _id, count: val }) => {
      for (let i = 0; i < count; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (count - 1 - i));
        if (
          d.getFullYear()     === _id.year  &&
          d.getMonth() + 1    === _id.month &&
          d.getDate()         === _id.day
        ) {
          result[i] = val;
        }
      }
    });

    return result;
  }
}

export const dashboardService = new DashboardService();