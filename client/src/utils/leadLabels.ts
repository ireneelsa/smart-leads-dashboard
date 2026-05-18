import type { LeadSource, LeadStatus } from "../types";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  lost: "Lost",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  instagram: "Instagram",
  referral: "Referral",
};
