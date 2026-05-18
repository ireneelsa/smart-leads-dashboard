import mongoose, { Document, Schema, Types } from "mongoose";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface ILead extends Document {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: LeadStatus;
  notes?: string;
  owner: Types.ObjectId;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "new",
    },
    notes: { type: String, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Lead = mongoose.model<ILead>("Lead", leadSchema);
