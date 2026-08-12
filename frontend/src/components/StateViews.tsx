import {
  AlertTriangle,
  DatabaseZap,
  RotateCcw,
  SearchX
} from "lucide-react";

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function LandingSkeleton() {
  return (
    <div className="report-grid" aria-label="Loading reports">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="report-card skeleton-card" key={index}>
          <div className="skeleton skeleton-icon" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-footer" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="table-skeleton" aria-label="Loading report rows">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="table-skeleton-row" key={index}>
          <span className="skeleton" />
          <span className="skeleton" />
          <span className="skeleton" />
          <span className="skeleton" />
          <span className="skeleton" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  actionLabel,
  onAction
}: ErrorStateProps) {
  return (
    <section className="state-view state-error" aria-live="polite">
      <span className="state-icon">
        <AlertTriangle size={22} aria-hidden="true" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <button className="button button-primary" type="button" onClick={onAction}>
        <RotateCcw size={16} aria-hidden="true" />
        {actionLabel}
      </button>
    </section>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <section className="state-view" aria-live="polite">
      <span className="state-icon">
        <SearchX size={22} aria-hidden="true" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      {actionLabel && onAction ? (
        <button className="button button-secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

export function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <section className="not-found">
      <span className="state-icon">
        <DatabaseZap size={24} aria-hidden="true" />
      </span>
      <h1>Report not found</h1>
      <p>The selected report is not available in this portal.</p>
      <button className="button button-primary" type="button" onClick={onBack}>
        Back to reports
      </button>
    </section>
  );
}

