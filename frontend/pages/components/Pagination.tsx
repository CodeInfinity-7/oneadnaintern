'use client';

interface Props {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ page, totalPages, onPrev, onNext }: Props) {
  return (
    <div className="d-flex justify-content-center align-items-center gap-3 mt-5 flex-wrap" role="navigation" aria-label="Pagination">
      <button onClick={onPrev} disabled={page === 1} className="btn btn-secondary" aria-label="Previous Page">
        Prev
      </button>
      <span className="fw-semibold text-primary-custom">
        Page {page} of {totalPages}
      </span>
      <button onClick={onNext} disabled={page >= totalPages} className="btn btn-secondary" aria-label="Next Page">
        Next
      </button>
    </div>
  );
}
