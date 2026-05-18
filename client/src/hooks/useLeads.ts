import { useCallback, useEffect, useState } from "react";
import { getLeads } from "../api/leads";
import type {
  ILeadDocument,
  LeadListQuery,
  LeadSource,
  LeadStatus,
} from "../types";

type LeadSort = NonNullable<LeadListQuery["sort"]>;
type StatusFilter = LeadStatus | "";
type SourceFilter = LeadSource | "";

interface UseLeadsOptions {
  initialPage?: number;
  limit?: number;
}

interface UseLeadsResult {
  leads: ILeadDocument[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string;
  search: string;
  status: StatusFilter;
  source: SourceFilter;
  sort: LeadSort;
  setSearch: (value: string) => void;
  setStatus: (value: StatusFilter) => void;
  setSource: (value: SourceFilter) => void;
  setSort: (value: LeadSort) => void;
  setPage: (value: number) => void;
  refetch: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Could not load leads. Please try again.";
}

export function useLeads(options: UseLeadsOptions = {}): UseLeadsResult {
  const { initialPage = 1, limit = 10 } = options;

  const [leads, setLeads] = useState<ILeadDocument[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatusState] = useState<StatusFilter>("");
  const [source, setSourceState] = useState<SourceFilter>("");
  const [sort, setSortState] = useState<LeadSort>("latest");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getLeads({
        page: currentPage,
        limit,
        search: debouncedSearch || undefined,
        status: status || undefined,
        source: source || undefined,
        sort,
      });

      setLeads(data.leads);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, limit, source, sort, status]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  const setStatus = useCallback((value: StatusFilter) => {
    setStatusState(value);
    setCurrentPage(1);
  }, []);

  const setSource = useCallback((value: SourceFilter) => {
    setSourceState(value);
    setCurrentPage(1);
  }, []);

  const setSort = useCallback((value: LeadSort) => {
    setSortState(value);
    setCurrentPage(1);
  }, []);

  const setPage = useCallback((value: number) => {
    setCurrentPage(Math.max(1, Math.floor(value)));
  }, []);

  return {
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
    refetch: fetchLeads,
  };
}
