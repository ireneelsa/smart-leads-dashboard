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
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        Previous
      </button>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        Page{" "}
        <span className="font-medium text-slate-900 dark:text-white">{currentPage}</span> of{" "}
        <span className="font-medium text-slate-900 dark:text-white">{totalPages}</span>
      </p>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        Next
      </button>
    </div>
  );
}
