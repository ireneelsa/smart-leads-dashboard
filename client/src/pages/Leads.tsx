import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import type { ILeadDocument, LeadSource, LeadStatus } from "../types";
import type { PaginatedLeadsResponse } from "../types";
import { LEAD_SOURCES, LEAD_STATUSES } from "../types";
import { SOURCE_LABELS, STATUS_LABELS } from "../utils";

const emptyForm = {
  name: "",
  email: "",
  source: "website" as LeadSource,
  status: "new" as LeadStatus,
};

export default function Leads() {
  const [leads, setLeads] = useState<ILeadDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get<PaginatedLeadsResponse>("/api/leads", {
        params,
      });
      setLeads(data.leads);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(lead: ILeadDocument) {
    setForm({
      name: lead.name,
      email: lead.email,
      source: lead.source,
      status: lead.status,
    });
    setEditingId(lead._id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      email: form.email,
      source: form.source,
      status: form.status,
    };

    try {
      if (editingId) {
        await api.put(`/api/leads/${editingId}`, payload);
      } else {
        await api.post("/api/leads", payload);
      }
      resetForm();
      fetchLeads();
    } catch {
      setError("Could not save lead. Please check the form and try again.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) return;
    await api.delete(`/api/leads/${id}`);
    fetchLeads();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, filter, and manage your pipeline
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Add lead
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            {editingId ? "Edit lead" : "New lead"}
          </h2>
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              required
              value={form.source}
              onChange={(e) =>
                setForm({ ...form, source: e.target.value as LeadSource })
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as LeadStatus })
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No leads found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {lead.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {SOURCE_LABELS[lead.source]}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(lead)}
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(lead._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
