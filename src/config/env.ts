import dotenv from "dotenv";
dotenv.config();

const requireEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) throw new Error(`Missing env variable: ${key}`);
  return value;
};

// Optional env — returns empty string if not set
const optionalEnv = (key: string): string =>
  process.env[key] ?? "";

export const env = {
  NODE_ENV:       requireEnv("NODE_ENV",       "development"),
  PORT:           parseInt(requireEnv("PORT",  "4000"), 10),
  HOST:           requireEnv("HOST",           "localhost"),
  CORS_ORIGIN:    requireEnv("CORS_ORIGIN",    "*"),
  MONGODB_URI:    requireEnv("MONGODB_URI"),
  DB_NAME:        requireEnv("DB_NAME",        "devhire"),
  JWT_SECRET:     requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: requireEnv("JWT_EXPIRES_IN", "7d"),

  // AI providers — at least one must be set
  GEMINI_API_KEY: optionalEnv("GEMINI_API_KEY"),
  GROK_API_KEY:   optionalEnv("GROK_API_KEY"),

  isDevelopment:  () => process.env.NODE_ENV === "development",
  isProduction:   () => process.env.NODE_ENV === "production",
} as const;