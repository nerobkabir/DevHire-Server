import http from "http";
import { createApp } from "./app";
import { connectDB, disconnectDB } from "./config/database";
import { env } from "./config/env";

const bootstrap = async (): Promise<void> => {
  // 1. Connect to MongoDB before accepting any HTTP traffic
  await connectDB();

  // 2. Build Express app
  const app    = createApp();
  const server = http.createServer(app);

  // 3. Graceful shutdown — close DB after HTTP server drains
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[server] ${signal} received — shutting down…`);

    server.close(async (err) => {
      if (err) {
        console.error("[server] Error closing HTTP server:", err);
        process.exit(1);
      }

      await disconnectDB();
      console.log("[server] All connections closed. Goodbye.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("[server] Forced shutdown after timeout.");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    console.error("[server] Unhandled rejection:", reason);
    shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (err) => {
    console.error("[server] Uncaught exception:", err);
    shutdown("uncaughtException");
  });

  // 4. Start listening
  server.listen(env.PORT, () => {
    console.log(`[server] Running in ${env.NODE_ENV} mode`);
    console.log(`[server] Listening at http://localhost:${env.PORT}`);
  });
};

bootstrap().catch((err) => {
  console.error("[server] Startup failed:", err);
  process.exit(1);
});