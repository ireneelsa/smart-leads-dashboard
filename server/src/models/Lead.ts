import mongoose, { Document, Schema, Types } from "mongoose";
import type { ILead, LeadSource, LeadStatus } from "../types/interfaces";

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "lost",
];

const LEAD_SOURCES: LeadSource[] = ["website", "instagram", "referral"];

export type ILeadDocument = Omit<ILead, "id"> & {
  createdBy: Types.ObjectId;
} & Document;

const leadSchema = new Schema<ILeadDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "new",
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: false },
);

export default mongoose.model<ILeadDocument>("Lead", leadSchema);
