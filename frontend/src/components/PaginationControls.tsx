import type { PageMetadata } from "../api/types";

interface PaginationControlsProps {
  pagination: PageMetadata;
  onPrevious: () => void;
  onNext: () => void;
}

export function PaginationControls({
  pagination,
  onPrevious,
  onNext
}: PaginationControlsProps) {
  return (
    <div className="pagination-bar">
      <span>
        Page {pagination.page + 1} of {Math.max(pagination.totalPages, 1)}
      </span>
      <div className="pagination-actions">
        <button
          className="button button-secondary"
          type="button"
          disabled={!pagination.hasPrevious}
          onClick={onPrevious}
        >
          Previous
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={!pagination.hasNext}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

