import api from "./axios";
import type {
  ILeadDocument,
  LeadListQuery,
  LeadSource,
  LeadStatus,
  PaginatedLeadsResponse,
} from "../types";

export interface CreateLeadData {
  name: string;
  email: string;
  source: LeadSource;
  status?: LeadStatus;
}

export type UpdateLeadData = Partial<CreateLeadData>;

export type GetLeadsParams = LeadListQuery;

function compactParams(
  params?: GetLeadsParams,
): Record<string, string | number> | undefined {
  if (!params) {
    return undefined;
  }

  const compacted: Record<string, string | number> = {};

  if (params.page !== undefined) compacted.page = params.page;
  if (params.limit !== undefined) compacted.limit = params.limit;
  if (params.status) compacted.status = params.status;
  if (params.source) compacted.source = params.source;
  if (params.search?.trim()) compacted.search = params.search.trim();
  if (params.sort) compacted.sort = params.sort;

  return compacted;
}

function getExportFilename(contentDisposition?: string): string {
  if (!contentDisposition) {
    return "leads.csv";
  }

  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "leads.csv";
}

export async function getLeads(
  params?: GetLeadsParams,
): Promise<PaginatedLeadsResponse> {
  const { data } = await api.get<PaginatedLeadsResponse>("/api/leads", {
    params: compactParams(params),
  });
  return data;
}

export async function createLead(
  data: CreateLeadData,
): Promise<ILeadDocument> {
  const response = await api.post<ILeadDocument>("/api/leads", data);
  return response.data;
}

export async function updateLead(
  id: string,
  data: UpdateLeadData,
): Promise<ILeadDocument> {
  const response = await api.put<ILeadDocument>(`/api/leads/${id}`, data);
  return response.data;
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/api/leads/${id}`);
}

export async function getLeadById(id: string): Promise<ILeadDocument> {
  const { data } = await api.get<ILeadDocument>(`/api/leads/${id}`);
  return data;
}

export async function exportLeads(params?: GetLeadsParams): Promise<void> {
  const response = await api.get<Blob>("/api/leads/export", {
    params: compactParams(params),
    responseType: "blob",
  });

  const filename = getExportFilename(response.headers["content-disposition"]);
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
