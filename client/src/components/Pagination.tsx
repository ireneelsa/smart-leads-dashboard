interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1 && !disabled;
  const canGoNext = currentPage < totalPages && !disabled;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <p className="text-sm text-slate-600">
        Page{" "}
        <span className="font-medium text-slate-900">{currentPage}</span> of{" "}
        <span className="font-medium text-slate-900">{totalPages}</span>
      </p>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
