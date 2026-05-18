import jwt from "jsonwebtoken";
import type { JwtPayload, UserRole } from "../types/interfaces";

export function signToken(userId: string, role: UserRole): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const payload: JwtPayload = { userId, role };
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}
