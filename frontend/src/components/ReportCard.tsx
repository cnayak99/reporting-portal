import {
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  Clock3,
  TableProperties,
  UsersRound
} from "lucide-react";
import { formatDate } from "../lib/reportView";
import type { ReportCatalogItem, ReportId } from "../types/reporting";
import { Sparkline } from "./Sparkline";

interface ReportCardProps {
  report: ReportCatalogItem;
  onOpen: (reportId: ReportId) => void;
}

const iconByReport = {
  users: UsersRound,
  departments: Building2,
  projects: BriefcaseBusiness
};

const sparkValuesByReport: Record<ReportId, number[]> = {
  users: [28, 36, 38, 44, 49, 52, 58, 63],
  departments: [6, 6, 7, 6, 8, 7, 9, 10],
  projects: [10, 12, 9, 14, 16, 13, 17, 19]
};

export function ReportCard({ report, onOpen }: ReportCardProps) {
  const Icon = iconByReport[report.icon];

  return (
    <article className={`report-card accent-${report.accent}`}>
      <div className="report-card-topline">
        <span className="report-icon">
          <Icon size={24} aria-hidden="true" />
        </span>
        <span className="report-eyebrow">{report.eyebrow}</span>
      </div>

      <div className="report-card-copy">
        <h2>{report.name}</h2>
        <p>{report.description}</p>
      </div>

      <div className="report-card-visual">
        <Sparkline values={sparkValuesByReport[report.id]} tone={report.accent} />
        <div>
          <strong>{report.signal}</strong>
          <span>{report.refreshCadence} refresh</span>
        </div>
      </div>

      <dl className="report-card-meta">
        <div>
          <dt>
            <TableProperties size={15} aria-hidden="true" />
            Rows
          </dt>
          <dd>{report.rowCount}</dd>
        </div>
        <div>
          <dt>
            <Clock3 size={15} aria-hidden="true" />
            Updated
          </dt>
          <dd>{formatDate(report.lastUpdated)}</dd>
        </div>
      </dl>

      <button
        className="button report-open-button"
        type="button"
        onClick={() => onOpen(report.id)}
      >
        Open report
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </article>
  );
}

