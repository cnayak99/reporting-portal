import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { ReportDetailPage } from "./components/ReportDetailPage";
import { ErrorState, NotFoundState, TableSkeleton } from "./components/StateViews";
import { useReportCatalog } from "./hooks/useReportCatalog";
import type { ReportId } from "./types/reporting";

type Route =
  | { name: "landing" }
  | { name: "report"; reportId: ReportId }
  | { name: "not-found" };

const reportIds: ReportId[] = ["users", "departments", "projects"];

export function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const catalogState = useReportCatalog();

  useEffect(() => {
    function handlePopState() {
      setRoute(parseRoute());
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const activeReport = useMemo(() => {
    if (route.name !== "report" || catalogState.status !== "success") {
      return undefined;
    }

    return catalogState.data.find((report) => report.id === route.reportId);
  }, [catalogState, route]);

  function navigate(path: string, nextRoute: Route) {
    window.history.pushState({}, "", path);
    setRoute(nextRoute);
    window.scrollTo({ top: 0 });
  }

  function navigateHome() {
    navigate("/", { name: "landing" });
  }

  function navigateReport(reportId: ReportId) {
    navigate(`/reports/${reportId}`, { name: "report", reportId });
  }

  return (
    <div className="app-shell">
      <aside className="app-rail" aria-label="Primary">
        <button
          className="brand-mark"
          type="button"
          onClick={navigateHome}
          title="Reporting Portal"
        >
          <BarChart3 size={23} aria-hidden="true" />
          <span className="sr-only">Reporting Portal</span>
        </button>

        <nav className="rail-nav">
          <button
            className={route.name === "landing" ? "is-active" : ""}
            type="button"
            onClick={navigateHome}
            title="Reports"
          >
            <LayoutDashboard size={20} aria-hidden="true" />
            <span className="sr-only">Reports</span>
          </button>
          <button
            className={
              route.name === "report" && route.reportId === "users"
                ? "is-active"
                : ""
            }
            type="button"
            onClick={() => navigateReport("users")}
            title="Users"
          >
            <UsersRound size={20} aria-hidden="true" />
            <span className="sr-only">Users</span>
          </button>
          <button
            className={
              route.name === "report" && route.reportId === "departments"
                ? "is-active"
                : ""
            }
            type="button"
            onClick={() => navigateReport("departments")}
            title="Departments"
          >
            <Building2 size={20} aria-hidden="true" />
            <span className="sr-only">Departments</span>
          </button>
          <button
            className={
              route.name === "report" && route.reportId === "projects"
                ? "is-active"
                : ""
            }
            type="button"
            onClick={() => navigateReport("projects")}
            title="Projects"
          >
            <ClipboardList size={20} aria-hidden="true" />
            <span className="sr-only">Projects</span>
          </button>
        </nav>
      </aside>

      <main className="app-main">{renderRoute()}</main>
    </div>
  );

  function renderRoute() {
    if (route.name === "landing") {
      return (
        <LandingPage
          catalogState={catalogState}
          onOpenReport={navigateReport}
          onRetry={catalogState.reload}
        />
      );
    }

    if (route.name === "not-found") {
      return <NotFoundState onBack={navigateHome} />;
    }

    if (catalogState.status === "loading") {
      return (
        <div className="page-stack">
          <section className="report-workbench">
            <TableSkeleton />
          </section>
        </div>
      );
    }

    if (catalogState.status === "error") {
      return (
        <ErrorState
          title="Reports could not be loaded"
          message={catalogState.error}
          actionLabel="Retry"
          onAction={catalogState.reload}
        />
      );
    }

    if (!activeReport) {
      return <NotFoundState onBack={navigateHome} />;
    }

    return <ReportDetailPage report={activeReport} onBack={navigateHome} />;
  }
}

function parseRoute(): Route {
  const [, reportId] = window.location.pathname.match(/^\/reports\/([^/]+)/) ?? [];

  if (!reportId) {
    return { name: "landing" };
  }

  if (reportIds.includes(reportId as ReportId)) {
    return { name: "report", reportId: reportId as ReportId };
  }

  return { name: "not-found" };
}

