import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import type { LeadStats } from "../types";
import { LEAD_STATUSES, STATUS_LABELS } from "../types";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  qualified: "bg-emerald-100 text-emerald-800",
  lost: "bg-slate-100 text-slate-600",
};

export default function Dashboard() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<LeadStats>("/api/leads/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your lead pipeline
          </p>
        </div>
        <Link
          to="/leads"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Manage leads
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Total leads</p>
        <p className="mt-1 text-4xl font-semibold text-slate-900">
          {stats?.total ?? 0}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LEAD_STATUSES.map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
            >
              {STATUS_LABELS[status]}
            </span>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {stats?.byStatus[status] ?? 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
