import morgan, { StreamOptions } from "morgan";
import { env } from "../config/env";

const stream: StreamOptions = {
  write: (message: string) => process.stdout.write(message),
};

const skip = (): boolean => env.isProduction() && env.LOG_LEVEL === "none";

export const requestLogger = morgan(
  env.isProduction() ? "combined" : "dev",
  { stream, skip }
);