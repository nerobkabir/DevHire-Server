import { Router, Request, Response } from "express";
import { getConnectionStatus } from "../config/database";
import { env } from "../config/env";

const router = Router();

router.get("/health", (_req: Request, res: Response): void => {
  const db = getConnectionStatus();

  // readyState 1 = connected
  const healthy   = db.readyState === 1;
  const statusCode = healthy ? 200 : 503;

  res.status(statusCode).json({
    success:     healthy,
    status:      healthy ? "ok" : "degraded",
    environment: env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    uptime:      `${Math.floor(process.uptime())}s`,
    database: {
      connected:  db.isConnected,
      readyState: db.readyState,
      host:       db.host,
      name:       db.name,
    },
  });
});

export default router;