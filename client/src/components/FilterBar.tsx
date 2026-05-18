import { useState } from "react";
import { exportLeads } from "../api/leads";
import type { LeadListQuery, LeadSource, LeadStatus, UserRole } from "../types";
import { LEAD_SOURCES, LEAD_STATUSES } from "../types";
import { SOURCE_LABELS, STATUS_LABELS } from "../utils";

type LeadSort = NonNullable<LeadListQuery["sort"]>;
type StatusFilter = LeadStatus | "";
type SourceFilter = LeadSource | "";

interface FilterBarProps {
  search: string;
  status: StatusFilter;
  source: SourceFilter;
  sort: LeadSort;
  userRole: UserRole;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSourceChange: (value: SourceFilter) => void;
  onSortChange: (value: LeadSort) => void;
}

const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:ring-indigo-400";

export default function FilterBar({
  search,
  status,
  source,
  sort,
  userRole,
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onSortChange,
}: FilterBarProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportLeads({
        search: search.trim() || undefined,
        status: status || undefined,
        source: source || undefined,
        sort,
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
      <input
        type="search"
        placeholder="Search name or email..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className={`${inputClass} min-w-0 flex-1`}
      />

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
        className={inputClass}
      >
        <option value="">All statuses</option>
        {LEAD_STATUSES.map((leadStatus) => (
          <option key={leadStatus} value={leadStatus}>
            {STATUS_LABELS[leadStatus]}
          </option>
        ))}
      </select>

      <select
        value={source}
        onChange={(event) => onSourceChange(event.target.value as SourceFilter)}
        className={inputClass}
      >
        <option value="">All sources</option>
        {LEAD_SOURCES.map((leadSource) => (
          <option key={leadSource} value={leadSource}>
            {SOURCE_LABELS[leadSource]}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as LeadSort)}
        className={inputClass}
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
      </select>

      {userRole === "admin" && (
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      )}
    </div>
  );
}
