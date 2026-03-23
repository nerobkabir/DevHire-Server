import dotenv from "dotenv";
dotenv.config();

const requireEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) throw new Error(`Missing env variable: ${key}`);
  return value;
};

export const env = {
  NODE_ENV:       requireEnv("NODE_ENV",       "development"),
  PORT:           parseInt(requireEnv("PORT",  "3000"), 10),
  HOST:           requireEnv("HOST",           "localhost"),
  CORS_ORIGIN:    requireEnv("CORS_ORIGIN",    "*"),
  MONGODB_URI:    requireEnv("MONGODB_URI"),
  DB_NAME:        requireEnv("DB_NAME",        "myapp"),
  JWT_SECRET:     requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: requireEnv("JWT_EXPIRES_IN", "7d"),
  GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),          // ← এটা যোগ করো
  isDevelopment:  () => process.env.NODE_ENV === "development",
  isProduction:   () => process.env.NODE_ENV === "production",
} as const;