import mongoose, { ConnectOptions } from "mongoose";
import { env } from "./env";

// ── Connection state ──────────────────────────────────────────────────────────
let isConnected = false;

// ── Options ───────────────────────────────────────────────────────────────────
const mongooseOptions: ConnectOptions = {
  dbName:             env.DB_NAME,
  serverSelectionTimeoutMS: 5_000,   // fail fast if server is unreachable
  socketTimeoutMS:         45_000,   // drop idle socket after 45 s
  maxPoolSize:             10,        // max simultaneous connections
  minPoolSize:             2,         // keep at least 2 warm
  retryWrites:             true,
  writeConcern:            { w: "majority" },
};

// ── Event listeners ───────────────────────────────────────────────────────────
const attachListeners = (): void => {
  const { connection } = mongoose;

  connection.on("connected", () => {
    isConnected = true;
    console.log(`[mongodb] Connected → ${connection.host}/${connection.name}`);
  });

  connection.on("error", (err: Error) => {
    isConnected = false;
    console.error("[mongodb] Connection error:", err.message);
  });

  connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[mongodb] Disconnected");
  });

  connection.on("reconnected", () => {
    isConnected = true;
    console.log("[mongodb] Reconnected");
  });
};

// ── Connect ───────────────────────────────────────────────────────────────────
export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log("[mongodb] Already connected, reusing existing connection");
    return;
  }

  attachListeners();

  try {
    // Verbose query logging in development only
    if (env.isDevelopment()) {
      mongoose.set("debug", (coll: string, method: string) => {
        console.log(`[mongodb] ${coll}.${method}`);
      });
    }

    await mongoose.connect(env.MONGODB_URI, mongooseOptions);
    // "connected" event above handles the isConnected flag and log
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mongodb] Initial connection failed:", message);
    throw err; // let server.ts decide whether to exit
  }
};

// ── Disconnect ────────────────────────────────────────────────────────────────
export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;

  try {
    await mongoose.connection.close();
    console.log("[mongodb] Connection closed gracefully");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mongodb] Error while closing connection:", message);
    throw err;
  }
};

// ── Health check ──────────────────────────────────────────────────────────────
export const getConnectionStatus = (): {
  isConnected: boolean;
  readyState: number;
  host: string | undefined;
  name: string | undefined;
} => {
  const { connection } = mongoose;
  return {
    isConnected,
    readyState: connection.readyState,  // 0=disconnected 1=connected 2=connecting 3=disconnecting
    host: connection.host,
    name: connection.name,
  };
};