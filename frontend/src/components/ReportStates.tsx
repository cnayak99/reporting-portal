interface LoadingStateProps {
  label: string;
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

interface EmptyStateProps {
  message: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="loading-panel" role="status">
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="inline-alert" role="status">
      <span>{message}</span>
      {onRetry ? (
        <button className="text-button" type="button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-panel" role="status">
      {message}
    </div>
  );
}

