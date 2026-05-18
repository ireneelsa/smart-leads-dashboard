export type UserRole = "admin" | "sales";

export type LeadStatus = "new" | "contacted" | "qualified" | "lost";

export type LeadSource = "website" | "instagram" | "referral";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ILead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}
