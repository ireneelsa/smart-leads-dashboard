import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import leadRoutes from "./routes/lead.routes";

dotenv.config();

interface ServerConfig {
  port: string;
  mongoUri: string;
  jwtSecret: string;
  frontendUrl: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required but was not provided`);
  }
  return value;
}

function loadConfig(): ServerConfig {
  return {
    port: getRequiredEnv("PORT"),
    mongoUri: getRequiredEnv("MONGO_URI"),
    jwtSecret: getRequiredEnv("JWT_SECRET"),
    frontendUrl: getRequiredEnv("FRONTEND_URL"),
  };
}

const config = loadConfig();
const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.use(
  (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    console.error("Unhandled error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ message });
  },
);

async function start(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

start().catch((error: unknown) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
