import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getDepartmentsReport,
  getProjectsReport
} from "../../api/reportingApi";
import type {
  DepartmentReportRow,
  PagedResponse,
  ProjectReportRow,
  ProjectStatus
} from "../../api/types";
import { PaginationControls } from "../../components/PaginationControls";
import { EmptyState, ErrorState, LoadingState } from "../../components/ReportStates";
import { ReportPageHeader } from "../../components/ReportPageHeader";

const projectStatuses: ProjectStatus[] = [
  "PLANNED",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED"
];

const pageSizes = [10, 25, 50, 100];
const sortableFields = ["id", "name", "status", "startDate", "endDate"] as const;

type ProjectSortField = (typeof sortableFields)[number];
type SortDirection = "asc" | "desc";

interface SortState {
  field: ProjectSortField;
  direction: SortDirection;
}

type ProjectsState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: PagedResponse<ProjectReportRow>; error?: undefined }
  | { status: "error"; data?: undefined; error: string };

type DepartmentOptionsState =
  | { status: "loading"; departments?: undefined; error?: undefined }
  | { status: "success"; departments: DepartmentReportRow[]; error?: undefined }
  | { status: "error"; departments?: undefined; error: string };

const defaultSort: SortState = { field: "name", direction: "asc" };

const columnHeaders: Array<{
  label: string;
  field?: ProjectSortField;
  align?: "right";
}> = [
  { label: "Project ID", field: "id", align: "right" },
  { label: "Project Name", field: "name" },
  { label: "Department" },
  { label: "Owner" },
  { label: "Status", field: "status" },
  { label: "Start Date", field: "startDate" },
  { label: "End Date", field: "endDate" }
];

export function ProjectReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryInput = searchParams.get("q") ?? "";
  const query = queryInput.trim();
  const status = parseStatus(searchParams.get("status"));
  const departmentId = parseDepartmentId(searchParams.get("departmentId"));
  const page = parsePositiveInteger(searchParams.get("page"), 0);
  const size = parsePageSize(searchParams.get("size"));
  const sort = parseSort(searchParams.get("sort"));
  const [reloadToken, setReloadToken] = useState(0);
  const [departmentReloadToken, setDepartmentReloadToken] = useState(0);
  const [state, setState] = useState<ProjectsState>({ status: "loading" });
  const [departmentOptions, setDepartmentOptions] =
    useState<DepartmentOptionsState>({ status: "loading" });

  const requestParams = useMemo(
    () => ({
      q: query || undefined,
      status,
      departmentId,
      page,
      size,
      sort: `${sort.field},${sort.direction}`
    }),
    [departmentId, page, query, size, sort.direction, sort.field, status]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setState({ status: "loading" });

      try {
        const data = await getProjectsReport(requestParams, controller.signal);
        setState({ status: "success", data });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Projects report could not be loaded."
        });
      }
    }

    void loadProjects();

    return () => controller.abort();
  }, [reloadToken, requestParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDepartmentOptions() {
      setDepartmentOptions({ status: "loading" });

      try {
        const data = await getDepartmentsReport(
          { page: 0, size: 100, sort: "name,asc" },
          controller.signal
        );
        setDepartmentOptions({
          status: "success",
          departments: data.items
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setDepartmentOptions({
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Department options could not be loaded."
        });
      }
    }

    void loadDepartmentOptions();

    return () => controller.abort();
  }, [departmentReloadToken]);

  const rows = state.status === "success" ? state.data.items : [];
  const pagination =
    state.status === "success" ? state.data.pagination : undefined;
  const departments =
    departmentOptions.status === "success" ? departmentOptions.departments : [];
  const selectedDepartmentKnown =
    departmentId !== undefined &&
    departments.some((department) => department.id === departmentId);
  const hasFilters = Boolean(query || status || departmentId);

  function updateParams(
    updates: Record<string, string | number | undefined>,
    resetPage = true
  ) {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (resetPage) {
      next.set("page", "0");
    }

    setSearchParams(next);
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    next.delete("status");
    next.delete("departmentId");
    next.set("page", "0");
    setSearchParams(next);
  }

  function changeSort(field: ProjectSortField) {
    const direction =
      sort.field === field && sort.direction === "asc" ? "desc" : "asc";
    updateParams({ sort: `${field},${direction}` });
  }

  return (
    <div className="page-stack">
      <ReportPageHeader
        kicker="Projects report"
        title="Projects"
        description="Track project ownership, status, timing, and department alignment from the backend report endpoint."
      />

      <section className="report-workbench" aria-labelledby="projects-table-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">/api/reports/projects</span>
            <h2 id="projects-table-title">Report rows</h2>
          </div>
          {pagination ? (
            <p className="result-count">
              {pagination.totalItems.toLocaleString()} total result
              {pagination.totalItems === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <form
          className="report-controls"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="field-control search-control">
            <label htmlFor="projects-search">Search projects</label>
            <input
              id="projects-search"
              type="search"
              value={queryInput}
              onChange={(event) =>
                updateParams({ q: toOptionalInputValue(event.target.value) })
              }
              placeholder="Project name"
            />
          </div>

          <div className="field-control">
            <label htmlFor="projects-status">Status</label>
            <select
              id="projects-status"
              value={status ?? ""}
              onChange={(event) =>
                updateParams({
                  status: parseStatus(event.target.value) ?? undefined
                })
              }
            >
              <option value="">All statuses</option>
              {projectStatuses.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {formatEnum(statusOption)}
                </option>
              ))}
            </select>
          </div>

          <div className="field-control">
            <label htmlFor="projects-department">Department</label>
            <select
              id="projects-department"
              value={departmentId ?? ""}
              disabled={departmentOptions.status === "loading"}
              onChange={(event) =>
                updateParams({
                  departmentId: parseDepartmentId(event.target.value)
                })
              }
            >
              <option value="">All departments</option>
              {departmentId !== undefined && !selectedDepartmentKnown ? (
                <option value={departmentId}>Selected department</option>
              ) : null}
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field-control compact-control">
            <label htmlFor="projects-page-size">Page size</label>
            <select
              id="projects-page-size"
              value={size}
              onChange={(event) =>
                updateParams({ size: Number(event.target.value) })
              }
            >
              {pageSizes.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          {hasFilters ? (
            <button
              className="button button-secondary"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          ) : null}
        </form>

        {departmentOptions.status === "error" ? (
          <div className="inline-note" role="status">
            <span>{departmentOptions.error}</span>
            <button
              className="text-button"
              type="button"
              onClick={() => setDepartmentReloadToken((current) => current + 1)}
            >
              Retry
            </button>
          </div>
        ) : null}

        {state.status === "loading" ? (
          <LoadingState label="Loading projects" />
        ) : null}

        {state.status === "error" ? (
          <ErrorState
            message={state.error}
            onRetry={() => setReloadToken((current) => current + 1)}
          />
        ) : null}

        {state.status === "success" && rows.length === 0 ? (
          <EmptyState message="No projects match this report view." />
        ) : null}

        {state.status === "success" && rows.length > 0 ? (
          <>
            <div className="table-frame">
              <table className="report-table">
                <thead>
                  <tr>
                    {columnHeaders.map((column) => {
                      const sortField = column.field;
                      const active =
                        sortField !== undefined && sort.field === sortField;
                      return (
                        <th
                          key={column.label}
                          scope="col"
                          className={
                            column.align === "right" ? "align-right" : undefined
                          }
                          aria-sort={
                            active
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          {sortField ? (
                            <button
                              className="table-sort-button"
                              type="button"
                              onClick={() => changeSort(sortField)}
                            >
                              {column.label}
                              {active ? (
                                sort.direction === "asc" ? (
                                  <ArrowUp
                                    size={14}
                                    aria-label="sorted ascending"
                                  />
                                ) : (
                                  <ArrowDown
                                    size={14}
                                    aria-label="sorted descending"
                                  />
                                )
                              ) : (
                                <ChevronsUpDown size={14} aria-hidden="true" />
                              )}
                            </button>
                          ) : (
                            column.label
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((project) => (
                    <tr key={project.id}>
                      <td className="align-right">{project.id}</td>
                      <td>{project.name}</td>
                      <td>{project.department}</td>
                      <td>{project.owner}</td>
                      <td>
                        <span
                          className={`status-pill ${statusTone(project.status)}`}
                        >
                          {formatEnum(project.status)}
                        </span>
                      </td>
                      <td>{formatDate(project.startDate)}</td>
                      <td>
                        {project.endDate ? formatDate(project.endDate) : "Ongoing"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination ? (
              <PaginationControls
                pagination={pagination}
                onPrevious={() =>
                  updateParams({ page: pagination.page - 1 }, false)
                }
                onNext={() => updateParams({ page: pagination.page + 1 }, false)}
              />
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

function parseStatus(value: string | null): ProjectStatus | undefined {
  return projectStatuses.includes(value as ProjectStatus)
    ? (value as ProjectStatus)
    : undefined;
}

function parseDepartmentId(value: string | null): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parsePageSize(value: string | null) {
  const parsed = Number(value);
  return pageSizes.includes(parsed) ? parsed : 25;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function toOptionalInputValue(value: string) {
  return value === "" ? undefined : value;
}

function parseSort(value: string | null): SortState {
  if (!value) {
    return defaultSort;
  }

  const [field, direction] = value.split(",");

  if (
    sortableFields.includes(field as ProjectSortField) &&
    (direction === "asc" || direction === "desc")
  ) {
    return { field: field as ProjectSortField, direction };
  }

  return defaultSort;
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  const localDateParts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = localDateParts
    ? new Date(
        Number(localDateParts[1]),
        Number(localDateParts[2]) - 1,
        Number(localDateParts[3])
      )
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(date);
}

function statusTone(status: ProjectStatus) {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "status-success";
  }

  if (status === "ON_HOLD") {
    return "status-warning";
  }

  if (status === "CANCELLED") {
    return "status-danger";
  }

  return "status-info";
}
