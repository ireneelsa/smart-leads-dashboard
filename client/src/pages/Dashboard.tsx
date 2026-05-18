import { useState } from "react";
import { deleteLead } from "../api/leads";
import FilterBar from "../components/FilterBar";
import LeadModal from "../components/LeadModal";
import LeadsTable from "../components/LeadsTable";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { useLeads } from "../hooks";
import type { ILead, ILeadDocument } from "../types";

type ModalState =
  | { mode: "create"; lead?: undefined }
  | { mode: "edit"; lead: ILead };

function leadDocumentToLead(lead: ILeadDocument): ILead {
  return {
    id: lead._id,
    name: lead.name,
    email: lead.email,
    status: lead.status,
    source: lead.source,
    createdAt: new Date(lead.createdAt),
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const {
    leads,
    totalPages,
    currentPage,
    isLoading,
    error,
    search,
    status,
    source,
    sort,
    setSearch,
    setStatus,
    setSource,
    setSort,
    setPage,
    refetch,
  } = useLeads();

  const userRole = user?.role ?? "sales";

  function handleEdit(lead: ILeadDocument) {
    setModalState({ mode: "edit", lead: leadDocumentToLead(lead) });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this lead?");
    if (!confirmed) {
      return;
    }

    await deleteLead(id);
    await refetch();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage and filter your lead pipeline
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          New Lead
        </button>
      </div>

      <FilterBar
        search={search}
        status={status}
        source={source}
        sort={sort}
        userRole={userRole}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSourceChange={setSource}
        onSortChange={setSort}
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        userRole={userRole}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {modalState && (
        <LeadModal
          mode={modalState.mode}
          lead={modalState.lead}
          onClose={() => setModalState(null)}
          refetch={refetch}
        />
      )}
    </div>
  );
}
