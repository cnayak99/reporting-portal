import {
  Activity,
  Database,
  RotateCcw,
  Search,
  ShieldCheck
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "../lib/reportView";
import type { AsyncState, ReportCatalogItem, ReportId } from "../types/reporting";
import { EmptyState, ErrorState, LandingSkeleton } from "./StateViews";
import { ReportCard } from "./ReportCard";

interface LandingPageProps {
  catalogState: AsyncState<ReportCatalogItem[]>;
  onOpenReport: (reportId: ReportId) => void;
  onRetry: () => void;
}

export function LandingPage({
  catalogState,
  onOpenReport,
  onRetry
}: LandingPageProps) {
  const [query, setQuery] = useState("");

  const reports = catalogState.status === "success" ? catalogState.data : [];
  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return reports;
    }

    return reports.filter((report) =>
      [report.name, report.eyebrow, report.description, report.steward]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, reports]);

  const summary = useMemo(() => {
    const totalRows = reports.reduce((sum, report) => sum + report.rowCount, 0);
    const totalColumns = reports.reduce(
      (sum, report) => sum + report.columnCount,
      0
    );
    const newestUpdate = reports
      .map((report) => report.lastUpdated)
      .sort()
      .at(-1);

    return {
      totalRows,
      totalColumns,
      newestUpdate
    };
  }, [reports]);

  return (
    <div className="page-stack">
      <section className="workspace-overview">
        <div className="overview-copy">
          <span className="section-kicker">Reporting Portal</span>
          <h1>Operational reports, ready for decision work.</h1>
          <p>
            Core workforce, organization, and project data in one governed
            workspace for fast operational review.
          </p>
        </div>

        <div className="overview-panel">
          <div className="overview-metric">
            <Database size={19} aria-hidden="true" />
            <span>{reports.length || 3} reports</span>
          </div>
          <div className="overview-metric">
            <Activity size={19} aria-hidden="true" />
            <span>{summary.totalRows || 28} rows indexed</span>
          </div>
          <div className="overview-metric">
            <ShieldCheck size={19} aria-hidden="true" />
            <span>{summary.totalColumns || 18} governed fields</span>
          </div>
          <div className="overview-last-updated">
            <span>Freshest update</span>
            <strong>
              {summary.newestUpdate ? formatDate(summary.newestUpdate) : "Loading"}
            </strong>
          </div>
        </div>
      </section>

      <section className="catalog-section" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Catalog</span>
            <h2 id="catalog-title">Available reports</h2>
          </div>
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search reports</span>
            <input
              type="search"
              placeholder="Search reports"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {catalogState.status === "loading" ? <LandingSkeleton /> : null}

        {catalogState.status === "error" ? (
          <ErrorState
            title="Reports could not be loaded"
            message={catalogState.error}
            actionLabel="Retry"
            onAction={onRetry}
          />
        ) : null}

        {catalogState.status === "success" && filteredReports.length > 0 ? (
          <div className="report-grid">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onOpen={onOpenReport}
              />
            ))}
          </div>
        ) : null}

        {catalogState.status === "success" && filteredReports.length === 0 ? (
          <EmptyState
            title="No reports match that search"
            message="Try a report name, owner, or reporting area."
            actionLabel="Clear search"
            onAction={() => setQuery("")}
          />
        ) : null}
      </section>

      <section className="readiness-strip" aria-label="Portal readiness">
        <div>
          <strong>Preview environment</strong>
          <span>Local reporting snapshot prepared for API handoff.</span>
        </div>
        <button className="icon-button" type="button" onClick={onRetry} title="Refresh catalog">
          <RotateCcw size={18} aria-hidden="true" />
          <span className="sr-only">Refresh catalog</span>
        </button>
      </section>
    </div>
  );
}
