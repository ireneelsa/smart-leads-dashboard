import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, UserRole } from "../types/interfaces";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "sales";
}

function isJwtPayload(decoded: unknown): decoded is JwtPayload {
  if (typeof decoded !== "object" || decoded === null) {
    return false;
  }

  const payload = decoded as Record<string, unknown>;
  return (
    typeof payload.userId === "string" &&
    isUserRole(payload.role)
  );
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT_SECRET is not configured" });
    return;
  }

  try {
    const decoded: unknown = jwt.verify(token, secret);
    if (!isJwtPayload(decoded)) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
