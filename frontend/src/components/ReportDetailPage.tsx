import {
  ArrowLeft,
  Download,
  Filter,
  RotateCcw,
  Search,
  WifiOff
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useReportRows } from "../hooks/useReportRows";
import {
  applyReportView,
  formatDate,
  formatStatus,
  getDefaultSort,
  getFacetValues,
  toCsv
} from "../lib/reportView";
import type {
  ReportCatalogItem,
  ReportRecord,
  SortDirection,
  SortState
} from "../types/reporting";
import { DataTable } from "./DataTable";
import { EmptyState, ErrorState, TableSkeleton } from "./StateViews";

interface ReportDetailPageProps {
  report: ReportCatalogItem;
  onBack: () => void;
}

const pageSizes = [5, 8, 12];

export function ReportDetailPage({ report, onBack }: ReportDetailPageProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>(() =>
    getDefaultSort(report.columns)
  );
  const [previewFailure, setPreviewFailure] = useState(false);
  const rowState = useReportRows(report.id, previewFailure);

  useEffect(() => {
    setQuery("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setPage(0);
    setSort(getDefaultSort(report.columns));
    setPreviewFailure(false);
  }, [report]);

  useEffect(() => {
    setPage(0);
  }, [query, statusFilter, departmentFilter, sort, pageSize]);

  const rows = rowState.status === "success" ? rowState.data : [];
  const statusOptions = useMemo(() => getFacetValues(rows, "status"), [rows]);
  const departmentOptions = useMemo(
    () => getFacetValues(rows, "department"),
    [rows]
  );

  const visibleRows = useMemo(
    () =>
      applyReportView(rows, query, statusFilter, departmentFilter, sort),
    [rows, query, statusFilter, departmentFilter, sort]
  );

  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = visibleRows.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  function handleSort(columnKey: string) {
    setSort((current) => {
      if (current.key !== columnKey) {
        return { key: columnKey, direction: "asc" };
      }

      return {
        key: columnKey,
        direction: nextDirection(current.direction)
      };
    });
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setDepartmentFilter("all");
  }

  function retryAfterError() {
    setPreviewFailure(false);
    rowState.reload();
  }

  function exportRows() {
    const csv = toCsv(report.columns, visibleRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-stack">
      <section className={`report-detail-header accent-${report.accent}`}>
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          Reports
        </button>

        <div className="detail-title-row">
          <div>
            <span className="section-kicker">{report.eyebrow}</span>
            <h1>{report.name}</h1>
            <p>{report.description}</p>
          </div>
          <dl className="detail-metrics">
            <div>
              <dt>Rows</dt>
              <dd>{report.rowCount}</dd>
            </div>
            <div>
              <dt>Fields</dt>
              <dd>{report.columnCount}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(report.lastUpdated)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="report-workbench" aria-labelledby="report-table-title">
        <div className="workbench-toolbar">
          <div>
            <span className="section-kicker">{report.steward}</span>
            <h2 id="report-table-title">Report rows</h2>
          </div>

          <div className="toolbar-actions">
            <button
              className={`icon-button ${previewFailure ? "is-active" : ""}`}
              type="button"
              aria-pressed={previewFailure}
              onClick={() => setPreviewFailure((current) => !current)}
              title={
                previewFailure
                  ? "Return to local data"
                  : "Preview connection error"
              }
            >
              <WifiOff size={18} aria-hidden="true" />
              <span className="sr-only">
                {previewFailure
                  ? "Return to local data"
                  : "Preview connection error"}
              </span>
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={rowState.reload}
              title="Refresh rows"
            >
              <RotateCcw size={18} aria-hidden="true" />
              <span className="sr-only">Refresh rows</span>
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={exportRows}
              disabled={visibleRows.length === 0}
            >
              <Download size={16} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="table-controls">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search table rows</span>
            <input
              type="search"
              placeholder="Search rows"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          {statusOptions.length > 0 ? (
            <label className="select-field">
              <Filter size={17} aria-hidden="true" />
              <span className="sr-only">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                {statusOptions.map((status) => (
                  <option value={status} key={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {departmentOptions.length > 0 ? (
            <label className="select-field">
              <Filter size={17} aria-hidden="true" />
              <span className="sr-only">Filter by department</span>
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
              >
                <option value="all">All departments</option>
                {departmentOptions.map((department) => (
                  <option value={department} key={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="select-field compact">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {pageSizes.map((size) => (
                <option value={size} key={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        {rowState.status === "loading" ? <TableSkeleton /> : null}

        {rowState.status === "error" ? (
          <ErrorState
            title="Report data could not be loaded"
            message={rowState.error}
            actionLabel="Reconnect"
            onAction={retryAfterError}
          />
        ) : null}

        {rowState.status === "success" && visibleRows.length === 0 ? (
          <EmptyState
            title="No rows match this view"
            message="Clear filters or search terms to restore the full dataset."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : null}

        {rowState.status === "success" && visibleRows.length > 0 ? (
          <>
            <DataTable
              columns={report.columns}
              rows={pageRows}
              sort={sort}
              onSort={handleSort}
            />
            <div className="pagination-bar">
              <span>
                Showing {currentPage * pageSize + 1}-
                {Math.min((currentPage + 1) * pageSize, visibleRows.length)} of{" "}
                {visibleRows.length}
              </span>
              <div className="pagination-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage + 1} of {pageCount}
                </span>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() =>
                    setPage((value) => Math.min(pageCount - 1, value + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

function nextDirection(direction: SortDirection): SortDirection {
  return direction === "asc" ? "desc" : "asc";
}

