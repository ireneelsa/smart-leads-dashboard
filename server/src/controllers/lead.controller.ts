import { Response } from "express";
import { isValidObjectId, SortOrder } from "mongoose";
import { AuthRequest } from "../middleware/auth.middleware";
import Lead, { ILeadDocument } from "../models/Lead";
import type { LeadSource, LeadStatus, UserRole } from "../types/interfaces";
import { LEAD_SOURCES, LEAD_STATUSES } from "../types/interfaces";

interface CreateLeadBody {
  name: string;
  email: string;
  source: LeadSource;
  status?: LeadStatus;
}

interface UpdateLeadBody {
  name?: string;
  email?: string;
  source?: LeadSource;
  status?: LeadStatus;
}

type LeadSortOption = "latest" | "oldest";

interface LeadFiltersQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
}

interface GetAllLeadsQuery extends LeadFiltersQuery {
  sort: LeadSortOption;
  page: number;
  limit: number;
}

type ParseLeadFiltersResult =
  | { success: true; filters: LeadFiltersQuery }
  | { success: false; message: string };

const CSV_HEADERS = [
  "Name",
  "Email",
  "Status",
  "Source",
  "Created At",
] as const;

interface PaginatedLeadsResponse {
  leads: ILeadDocument[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

type ParseGetAllLeadsResult =
  | { success: true; query: GetAllLeadsQuery }
  | { success: false; message: string };

type LeadListFilter = {
  status?: LeadStatus;
  source?: LeadSource;
  $or?: Array<{ name: RegExp } | { email: RegExp }>;
  $and?: LeadListFilter[];
};

function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

function isLeadSource(value: string): value is LeadSource {
  return (LEAD_SOURCES as readonly string[]).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getAuthenticatedUserId(req: AuthRequest): string | null {
  return req.user?.userId ?? null;
}

interface AuthContext {
  userId: string;
  role: UserRole;
}

type AccessCheckResult =
  | { allowed: true }
  | { allowed: false; message: string };

function getAuthContext(req: AuthRequest): AuthContext | null {
  if (!req.user) {
    return null;
  }
  return { userId: req.user.userId, role: req.user.role };
}

function isLeadOwner(lead: ILeadDocument, userId: string): boolean {
  return lead.createdBy.toString() === userId;
}

function assertCanUpdateLead(
  req: AuthRequest,
  lead: ILeadDocument,
): AccessCheckResult {
  const auth = getAuthContext(req);
  if (!auth) {
    return { allowed: false, message: "Authentication required" };
  }

  if (auth.role === "admin") {
    return { allowed: true };
  }

  if (auth.role === "sales" && isLeadOwner(lead, auth.userId)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    message: "Forbidden: sales users can only update leads they created",
  };
}

function assertCanDeleteLead(req: AuthRequest): AccessCheckResult {
  const auth = getAuthContext(req);
  if (!auth) {
    return { allowed: false, message: "Authentication required" };
  }

  if (auth.role === "admin") {
    return { allowed: true };
  }

  return {
    allowed: false,
    message: "Forbidden: sales users cannot delete leads",
  };
}

function parseCreateLeadBody(body: unknown): CreateLeadBody | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const name = record.name;
  const email = record.email;
  const source = record.source;
  const status = record.status;

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(source) ||
    !isLeadSource(source)
  ) {
    return null;
  }

  if (status !== undefined) {
    if (!isNonEmptyString(status) || !isLeadStatus(status)) {
      return null;
    }
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    source,
    status: status as LeadStatus | undefined,
  };
}

function parseUpdateLeadBody(body: unknown): UpdateLeadBody | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const parsed: UpdateLeadBody = {};

  if (record.name !== undefined) {
    if (!isNonEmptyString(record.name)) return null;
    parsed.name = record.name.trim();
  }

  if (record.email !== undefined) {
    if (!isNonEmptyString(record.email)) return null;
    parsed.email = record.email.trim().toLowerCase();
  }

  if (record.source !== undefined) {
    if (!isNonEmptyString(record.source) || !isLeadSource(record.source)) {
      return null;
    }
    parsed.source = record.source;
  }

  if (record.status !== undefined) {
    if (!isNonEmptyString(record.status) || !isLeadStatus(record.status)) {
      return null;
    }
    parsed.status = record.status;
  }

  if (Object.keys(parsed).length === 0) {
    return null;
  }

  return parsed;
}

function isLeadSortOption(value: string): value is LeadSortOption {
  return value === "latest" || value === "oldest";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePagination(query: AuthRequest["query"]): {
  page: number;
  limit: number;
} {
  const pageRaw = typeof query.page === "string" ? Number(query.page) : 1;
  const limitRaw = typeof query.limit === "string" ? Number(query.limit) : 10;

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), 100)
      : 10;

  return { page, limit };
}

function parseLeadFiltersQuery(
  query: AuthRequest["query"],
): ParseLeadFiltersResult {
  const statusParam = query.status;
  if (statusParam !== undefined) {
    if (typeof statusParam !== "string" || !isLeadStatus(statusParam)) {
      return {
        success: false,
        message: "Invalid status. Use: new, contacted, qualified, or lost",
      };
    }
  }

  const sourceParam = query.source;
  if (sourceParam !== undefined) {
    if (typeof sourceParam !== "string" || !isLeadSource(sourceParam)) {
      return {
        success: false,
        message: "Invalid source. Use: website, instagram, or referral",
      };
    }
  }

  const searchParam = query.search;
  if (searchParam !== undefined) {
    if (typeof searchParam !== "string" || !searchParam.trim()) {
      return { success: false, message: "search must be a non-empty string" };
    }
  }

  const filters: LeadFiltersQuery = {};

  if (typeof statusParam === "string") {
    filters.status = statusParam;
  }
  if (typeof sourceParam === "string") {
    filters.source = sourceParam;
  }
  if (typeof searchParam === "string") {
    filters.search = searchParam.trim();
  }

  return { success: true, filters };
}

function parseGetAllLeadsQuery(
  query: AuthRequest["query"],
): ParseGetAllLeadsResult {
  const filtersResult = parseLeadFiltersQuery(query);
  if (!filtersResult.success) {
    return filtersResult;
  }

  const { page, limit } = parsePagination(query);

  const sortParam =
    typeof query.sort === "string" ? query.sort : "latest";
  if (!isLeadSortOption(sortParam)) {
    return {
      success: false,
      message: "Invalid sort. Use: latest or oldest",
    };
  }

  return {
    success: true,
    query: {
      ...filtersResult.filters,
      sort: sortParam,
      page,
      limit,
    },
  };
}

function buildLeadFilter(params: LeadFiltersQuery): LeadListFilter {
  const conditions: LeadListFilter[] = [];

  if (params.status) {
    conditions.push({ status: params.status });
  }

  if (params.source) {
    conditions.push({ source: params.source });
  }

  if (params.search) {
    const regex = new RegExp(escapeRegex(params.search), "i");
    conditions.push({ $or: [{ name: regex }, { email: regex }] });
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $and: conditions };
}

function getSortOrder(sort: LeadSortOption): Record<string, SortOrder> {
  return { createdAt: sort === "oldest" ? 1 : -1 };
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCreatedAt(date: Date): string {
  return date.toISOString();
}

function leadsToCsv(leads: ILeadDocument[]): string {
  const headerRow = CSV_HEADERS.join(",");
  const dataRows = leads.map((lead) =>
    [
      escapeCsvField(lead.name),
      escapeCsvField(lead.email),
      escapeCsvField(lead.status),
      escapeCsvField(lead.source),
      escapeCsvField(formatCreatedAt(lead.createdAt)),
    ].join(","),
  );

  return [headerRow, ...dataRows].join("\n");
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

export async function createLead(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const parsed = parseCreateLeadBody(req.body);
    if (!parsed) {
      res.status(400).json({
        message:
          "name, email, and source (website | instagram | referral) are required",
      });
      return;
    }

    const lead = await Lead.create({
      name: parsed.name,
      email: parsed.email,
      source: parsed.source,
      status: parsed.status,
      createdBy: userId,
    });

    res.status(201).json(lead);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({ message: "A lead with this email already exists" });
      return;
    }
    console.error("createLead error:", error);
    res.status(500).json({ message: "Failed to create lead" });
  }
}

export async function updateLead(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid lead id" });
      return;
    }

    const parsed = parseUpdateLeadBody(req.body);
    if (!parsed) {
      res.status(400).json({ message: "No valid fields provided to update" });
      return;
    }

    const existingLead = await Lead.findById(id);
    if (!existingLead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    const updateAccess = assertCanUpdateLead(req, existingLead);
    if (!updateAccess.allowed) {
      const status = updateAccess.message.startsWith("Forbidden") ? 403 : 401;
      res.status(status).json({ message: updateAccess.message });
      return;
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { $set: parsed },
      { new: true, runValidators: true },
    );

    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.status(200).json(lead);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({ message: "A lead with this email already exists" });
      return;
    }
    console.error("updateLead error:", error);
    res.status(500).json({ message: "Failed to update lead" });
  }
}

export async function deleteLead(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid lead id" });
      return;
    }

    const deleteAccess = assertCanDeleteLead(req);
    if (!deleteAccess.allowed) {
      const status = deleteAccess.message.startsWith("Forbidden") ? 403 : 401;
      res.status(status).json({ message: deleteAccess.message });
      return;
    }

    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("deleteLead error:", error);
    res.status(500).json({ message: "Failed to delete lead" });
  }
}

export async function getLeadById(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid lead id" });
      return;
    }

    const lead = await Lead.findById(id).populate("createdBy", "name email");
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.status(200).json(lead);
  } catch (error) {
    console.error("getLeadById error:", error);
    res.status(500).json({ message: "Failed to fetch lead" });
  }
}

export async function getAllLeads(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const parsed = parseGetAllLeadsQuery(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.message });
      return;
    }

    const { status, source, search, sort, page, limit } = parsed.query;
    const filter = buildLeadFilter({ status, source, search });
    const skip = (page - 1) * limit;

    const [leads, totalCount] = await Promise.all([
      Lead.find(filter)
        .sort(getSortOrder(sort))
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email"),
      Lead.countDocuments(filter),
    ]);

    const response: PaginatedLeadsResponse = {
      leads,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("getAllLeads error:", error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
}

export async function exportLeads(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const parsed = parseLeadFiltersQuery(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.message });
      return;
    }

    const filter = buildLeadFilter(parsed.filters);
    const leads = await Lead.find(filter).sort({ createdAt: -1 });

    const csv = leadsToCsv(leads);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="leads.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error("exportLeads error:", error);
    res.status(500).json({ message: "Failed to export leads" });
  }
}
