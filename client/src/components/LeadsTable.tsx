import type { ILeadDocument, LeadSource, LeadStatus, UserRole } from "../types";
import { SOURCE_LABELS, STATUS_LABELS } from "../utils";

interface LeadsTableProps {
  leads: ILeadDocument[];
  isLoading: boolean;
  userRole: UserRole;
  onEdit: (lead: ILeadDocument) => void;
  onDelete: (id: string) => void;
}

const statusClassNames: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SourceLabel({ source }: { source: LeadSource }) {
  return <span>{SOURCE_LABELS[source]}</span>;
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <tr key={index} className="border-b border-slate-100">
          {Array.from({ length: 6 }, (__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 w-full max-w-32 animate-pulse rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function LeadsTable({
  leads,
  isLoading,
  userRole,
  onEdit,
  onDelete,
}: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Created At</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRows />
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {lead.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClassNames[lead.status]}`}
                    >
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <SourceLabel source={lead.source} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(lead)}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      {userRole === "admin" && (
                        <button
                          type="button"
                          onClick={() => onDelete(lead._id)}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
