import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/User";
import type { UserRole } from "../types/interfaces";
import { signToken } from "../utils/token";

const SALT_ROUNDS = 10;

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginBody {
  email: string;
  password: string;
}

function isUserRole(value: string): value is UserRole {
  return value === "admin" || value === "sales";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseRegisterBody(body: unknown): RegisterBody | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const { name, email, password, role } = body as Record<string, unknown>;

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password) ||
    !isNonEmptyString(role) ||
    !isUserRole(role)
  ) {
    return null;
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
  };
}

function parseLoginBody(body: unknown): LoginBody | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const { email, password } = body as Record<string, unknown>;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return null;
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = parseRegisterBody(req.body);
    if (!parsed) {
      res.status(400).json({
        message: "name, email, password, and role (admin | sales) are required",
      });
      return;
    }

    const { name, email, password, role } = parsed;

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = signToken(user._id.toString(), user.role);
    res.status(201).json({ token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = parseLoginBody(req.body);
    if (!parsed) {
      res.status(400).json({ message: "email and password are required" });
      return;
    }

    const { email, password } = parsed;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = signToken(user._id.toString(), user.role);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const payload = req.user;
    if (!payload) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
}
