import { AlertTriangle, ArrowRight, Database, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getReportCatalog } from "../../api/reportingApi";
import type { ReportMetadata } from "../../api/types";

const fallbackReports: ReportMetadata[] = [
  {
    id: "users",
    name: "Users",
    description: "People in the system with role, status, email, and creation date.",
    endpoint: "/api/reports/users"
  },
  {
    id: "departments",
    name: "Departments",
    description: "Org structure with manager, employee count, and location.",
    endpoint: "/api/reports/departments"
  },
  {
    id: "projects",
    name: "Projects",
    description: "Active and past work by department, owner, status, and dates.",
    endpoint: "/api/reports/projects"
  }
];

type CatalogState =
  | { status: "loading"; reports: ReportMetadata[]; error?: undefined }
  | { status: "success"; reports: ReportMetadata[]; error?: undefined }
  | { status: "error"; reports: ReportMetadata[]; error: string };

export function CatalogPage() {
  const [query, setQuery] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<CatalogState>({
    status: "loading",
    reports: fallbackReports
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
      setState((current) => ({ status: "loading", reports: current.reports }));

      try {
        const reports = await getReportCatalog(controller.signal);
        setState({ status: "success", reports });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          reports: fallbackReports,
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
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return state.reports;
    }

    return state.reports.filter((report) =>
      [report.name, report.description, report.endpoint]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, state.reports]);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="section-kicker">Reporting Portal</span>
          <h1>Operational reports, ready for decision work.</h1>
          <p>
            A focused React shell for browsing report metadata now, with typed
            API integration ready for report tables in the next phase.
          </p>
        </div>

        <div className="hero-metrics" aria-label="Catalog summary">
          <div>
            <Database size={19} aria-hidden="true" />
            <span>{state.reports.length} reports</span>
          </div>
          <div>
            <span>API base</span>
            <strong>/api</strong>
          </div>
        </div>
      </section>

      <section className="catalog-panel" aria-labelledby="catalog-title">
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

        <div className="report-grid">
          {visibleReports.map((report) => (
            <article className="report-card" key={report.id}>
              <span className="report-card-eyebrow">{report.endpoint}</span>
              <h3>{report.name}</h3>
              <p>{report.description}</p>
              <Link className="button button-primary" to={`/reports/${report.id}`}>
                Open route
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        {visibleReports.length === 0 ? (
          <div className="empty-panel" role="status">
            No reports match that search.
          </div>
        ) : null}
      </section>
    </div>
  );
}

