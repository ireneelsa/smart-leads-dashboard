import mongoose, { Document, Schema } from "mongoose";
import type { IUser, UserRole } from "../types/interfaces";

const USER_ROLES: UserRole[] = ["admin", "sales"];

export type IUserDocument = Omit<IUser, "id"> & Document;

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: { type: String, enum: USER_ROLES, default: "sales" },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUserDocument>("User", userSchema);
