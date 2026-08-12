import { AlertTriangle, ArrowRight, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getReportCatalog } from "../../api/reportingApi";
import type { ReportMetadata } from "../../api/types";

type CatalogState =
  | { status: "loading"; reports?: undefined; error?: undefined }
  | { status: "success"; reports: ReportMetadata[]; error?: undefined }
  | { status: "error"; reports?: undefined; error: string };

export function CatalogPage() {
  const [query, setQuery] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<CatalogState>({
    status: "loading"
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
      setState({ status: "loading" });

      try {
        const reports = await getReportCatalog(controller.signal);
        setState({ status: "success", reports });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Report catalog could not be loaded."
        });
      }
    }

    void loadReports();

    return () => controller.abort();
  }, [reloadToken]);

  const visibleReports = useMemo(() => {
    if (state.status !== "success") {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return state.reports;
    }

    return state.reports.filter((report) =>
      report.name.toLowerCase().includes(normalizedQuery)
    );
  }, [query, state]);

  const hasReports = state.status === "success" && state.reports.length > 0;
  const hasNoMatches = hasReports && visibleReports.length === 0;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="section-kicker">Reporting Portal</span>
          <h1>Operational reports, ready for decision work.</h1>
          <p>
            Browse the live reporting catalog, find the report you need, and
            open the route prepared for the table experience.
          </p>
        </div>
      </section>

      <section className="catalog-panel" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Catalog</span>
            <h2 id="catalog-title">Available reports</h2>
          </div>

          <label className="search-field" htmlFor="report-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search reports by name</span>
            <input
              id="report-search"
              type="search"
              placeholder="Search reports"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {state.status === "loading" ? (
          <div className="loading-panel" role="status">
            <Loader2 size={20} aria-hidden="true" />
            <span>Loading reports</span>
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="inline-alert" role="status">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>{state.error}</span>
            <button
              className="text-button"
              type="button"
              onClick={() => setReloadToken((current) => current + 1)}
            >
              Retry
            </button>
          </div>
        ) : null}

        {state.status === "success" && state.reports.length === 0 ? (
          <div className="empty-panel" role="status">
            No reports are available yet.
          </div>
        ) : null}

        {hasNoMatches ? (
          <div className="empty-panel" role="status">
            No reports match "{query.trim()}".
          </div>
        ) : null}

        {visibleReports.length > 0 ? (
          <div className="report-grid">
            {visibleReports.map((report) => (
              <article className="report-card" key={report.id}>
                <span className="report-card-eyebrow">{report.endpoint}</span>
                <h3>{report.name}</h3>
                <p>{report.description}</p>
                <Link
                  className="button button-primary"
                  to={`/reports/${report.id}`}
                  aria-label={`Open ${report.name} report`}
                >
                  Open report
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
