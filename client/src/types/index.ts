export type LeadStatus = "new" | "contacted" | "qualified" | "lost";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales";
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
}

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "lost",
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  lost: "Lost",
};
