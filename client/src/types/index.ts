export type UserRole = "admin" | "sales";

export type LeadStatus = "new" | "contacted" | "qualified" | "lost";

export type LeadSource = "website" | "instagram" | "referral";

export const LEAD_STATUSES: readonly LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "lost",
];

export const LEAD_SOURCES: readonly LeadSource[] = [
  "website",
  "instagram",
  "referral",
];

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

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export type StoredAuthUser = Omit<AuthUser, "token">;

/** User returned from GET /api/auth/me */
export type IUserProfile = Omit<IUser, "password">;

export interface AuthTokenResponse {
  token: string;
}

export interface ICreatedByUser {
  _id: string;
  name: string;
  email: string;
}

/** Lead document shape returned by the MongoDB API */
export interface ILeadDocument {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
  createdBy: string | ICreatedByUser;
}

export interface PaginatedLeadsResponse {
  leads: ILeadDocument[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface LeadListQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: "latest" | "oldest";
  page?: number;
  limit?: number;
}
