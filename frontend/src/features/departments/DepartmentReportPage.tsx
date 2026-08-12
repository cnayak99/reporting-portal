import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getDepartmentsReport } from "../../api/reportingApi";
import type { DepartmentReportRow, PagedResponse } from "../../api/types";
import { PaginationControls } from "../../components/PaginationControls";
import { EmptyState, ErrorState, LoadingState } from "../../components/ReportStates";
import { ReportPageHeader } from "../../components/ReportPageHeader";

const pageSizes = [10, 25, 50, 100];
const sortableFields = ["id", "name", "location"] as const;

type DepartmentSortField = (typeof sortableFields)[number];
type SortDirection = "asc" | "desc";

interface SortState {
  field: DepartmentSortField;
  direction: SortDirection;
}

type DepartmentsState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | {
      status: "success";
      data: PagedResponse<DepartmentReportRow>;
      error?: undefined;
    }
  | { status: "error"; data?: undefined; error: string };

const defaultSort: SortState = { field: "name", direction: "asc" };

const columnHeaders: Array<{
  label: string;
  field?: DepartmentSortField;
  align?: "right";
}> = [
  { label: "Department ID", field: "id", align: "right" },
  { label: "Department Name", field: "name" },
  { label: "Manager" },
  { label: "Employee Count", align: "right" },
  { label: "Location", field: "location" }
];

export function DepartmentReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const location = searchParams.get("location")?.trim() ?? "";
  const page = parsePositiveInteger(searchParams.get("page"), 0);
  const size = parsePageSize(searchParams.get("size"));
  const sort = parseSort(searchParams.get("sort"));
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<DepartmentsState>({ status: "loading" });

  const requestParams = useMemo(
    () => ({
      q: query || undefined,
      location: location || undefined,
      page,
      size,
      sort: `${sort.field},${sort.direction}`
    }),
    [location, page, query, size, sort.direction, sort.field]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadDepartments() {
      setState({ status: "loading" });

      try {
        const data = await getDepartmentsReport(
          requestParams,
          controller.signal
        );
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
              : "Departments report could not be loaded."
        });
      }
    }

    void loadDepartments();

    return () => controller.abort();
  }, [reloadToken, requestParams]);

  const rows = state.status === "success" ? state.data.items : [];
  const pagination =
    state.status === "success" ? state.data.pagination : undefined;
  const hasFilters = Boolean(query || location);

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
    next.delete("location");
    next.set("page", "0");
    setSearchParams(next);
  }

  function changeSort(field: DepartmentSortField) {
    const direction =
      sort.field === field && sort.direction === "asc" ? "desc" : "asc";
    updateParams({ sort: `${field},${direction}` });
  }

  return (
    <div className="page-stack">
      <ReportPageHeader
        kicker="Departments report"
        title="Departments"
        description="Review department ownership, employee counts, and locations from the backend report endpoint."
      />

      <section
        className="report-workbench"
        aria-labelledby="departments-table-title"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">/api/reports/departments</span>
            <h2 id="departments-table-title">Report rows</h2>
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
          <label className="field-control search-control">
            <span>Search departments</span>
            <input
              type="search"
              value={query}
              onChange={(event) =>
                updateParams({ q: event.target.value.trim() || undefined })
              }
              placeholder="Department name"
            />
          </label>

          <label className="field-control search-control">
            <span>Location</span>
            <input
              type="search"
              value={location}
              onChange={(event) =>
                updateParams({
                  location: event.target.value.trim() || undefined
                })
              }
              placeholder="City, state, or region"
            />
          </label>

          <label className="field-control compact-control">
            <span>Page size</span>
            <select
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
          </label>

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

        {state.status === "loading" ? (
          <LoadingState label="Loading departments" />
        ) : null}

        {state.status === "error" ? (
          <ErrorState
            message={state.error}
            onRetry={() => setReloadToken((current) => current + 1)}
          />
        ) : null}

        {state.status === "success" && rows.length === 0 ? (
          <EmptyState message="No departments match this report view." />
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
                  {rows.map((department) => (
                    <tr key={department.id}>
                      <td className="align-right">{department.id}</td>
                      <td>{department.name}</td>
                      <td>{department.manager ?? "Unassigned"}</td>
                      <td className="align-right">
                        {department.employeeCount.toLocaleString()}
                      </td>
                      <td>{department.location}</td>
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

function parsePageSize(value: string | null) {
  const parsed = Number(value);
  return pageSizes.includes(parsed) ? parsed : 25;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseSort(value: string | null): SortState {
  if (!value) {
    return defaultSort;
  }

  const [field, direction] = value.split(",");

  if (
    sortableFields.includes(field as DepartmentSortField) &&
    (direction === "asc" || direction === "desc")
  ) {
    return { field: field as DepartmentSortField, direction };
  }

  return defaultSort;
}
