import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { notFound, errorHandler } from "./middleware/errorHandler";
import router from "./routes";

export const createApp = (): Application => {
  const app = express();

  // ── Security middleware ─────────────────────────────────────────────────────
  app.use(helmet());                        // Sets secure HTTP response headers
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // ── Request parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ── Logging ─────────────────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── Trust proxy (for deployments behind load balancers / reverse proxies) ──
  if (env.isProduction()) {
    app.set("trust proxy", 1);
  }

  // ── Routes ──────────────────────────────────────────────────────────────────
  app.use("/api/v1", router);

  // ── Error handling (must be last) ───────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};