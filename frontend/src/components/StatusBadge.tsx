import { formatStatus } from "../lib/reportView";

interface StatusBadgeProps {
  value: string;
}

const toneByStatus: Record<string, string> = {
  ACTIVE: "is-success",
  COMPLETED: "is-success",
  PLANNED: "is-info",
  ON_LEAVE: "is-warn",
  ON_HOLD: "is-warn",
  INACTIVE: "is-muted",
  CANCELLED: "is-danger"
};

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${toneByStatus[value] ?? "is-muted"}`}>
      {formatStatus(value)}
    </span>
  );
}

