import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getUsersReport } from "../../api/reportingApi";
import type {
  PagedResponse,
  UserReportRow,
  UserRole,
  UserStatus
} from "../../api/types";
import { PaginationControls } from "../../components/PaginationControls";
import { EmptyState, ErrorState, LoadingState } from "../../components/ReportStates";
import { ReportPageHeader } from "../../components/ReportPageHeader";

const userRoles: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "ANALYST",
  "ENGINEER",
  "OPERATIONS"
];

const userStatuses: UserStatus[] = ["ACTIVE", "INACTIVE", "ON_LEAVE"];

const pageSizes = [10, 25, 50, 100];

const sortableFields = [
  "id",
  "name",
  "email",
  "role",
  "status",
  "createdAt"
] as const;

type UserSortField = (typeof sortableFields)[number];
type SortDirection = "asc" | "desc";

interface SortState {
  field: UserSortField;
  direction: SortDirection;
}

type UsersState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: PagedResponse<UserReportRow>; error?: undefined }
  | { status: "error"; data?: undefined; error: string };

const defaultSort: SortState = { field: "name", direction: "asc" };

const columnHeaders: Array<{
  label: string;
  field: UserSortField;
  align?: "right";
}> = [
  { label: "User ID", field: "id", align: "right" },
  { label: "Name", field: "name" },
  { label: "Email", field: "email" },
  { label: "Role", field: "role" },
  { label: "Status", field: "status" },
  { label: "Created Date", field: "createdAt" }
];

export function UserReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const role = parseRole(searchParams.get("role"));
  const status = parseStatus(searchParams.get("status"));
  const page = parsePositiveInteger(searchParams.get("page"), 0);
  const size = parsePageSize(searchParams.get("size"));
  const sort = parseSort(searchParams.get("sort"));
  const [state, setState] = useState<UsersState>({ status: "loading" });

  const requestParams = useMemo(
    () => ({
      q: query || undefined,
      role,
      status,
      page,
      size,
      sort: `${sort.field},${sort.direction}`
    }),
    [page, query, role, size, sort.direction, sort.field, status]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setState({ status: "loading" });

      try {
        const data = await getUsersReport(requestParams, controller.signal);
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
              : "Users report could not be loaded."
        });
      }
    }

    void loadUsers();

    return () => controller.abort();
  }, [requestParams]);

  const rows = state.status === "success" ? state.data.items : [];
  const pagination =
    state.status === "success" ? state.data.pagination : undefined;
  const hasFilters = Boolean(query || role || status);

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
    next.delete("role");
    next.delete("status");
    next.set("page", "0");
    setSearchParams(next);
  }

  function changeSort(field: UserSortField) {
    const direction =
      sort.field === field && sort.direction === "asc" ? "desc" : "asc";
    updateParams({ sort: `${field},${direction}` });
  }

  return (
    <div className="page-stack">
      <ReportPageHeader
        kicker="Users report"
        title="Users"
        description="Search and review user identity, role, status, and creation date from the backend report endpoint."
      />

      <section className="report-workbench" aria-labelledby="users-table-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">/api/reports/users</span>
            <h2 id="users-table-title">Report rows</h2>
          </div>
          {pagination ? (
            <p className="result-count">
              {pagination.totalItems.toLocaleString()} total result
              {pagination.totalItems === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <form className="report-controls" onSubmit={(event) => event.preventDefault()}>
          <label className="field-control search-control">
            <span>Search users</span>
            <input
              type="search"
              value={query}
              onChange={(event) =>
                updateParams({ q: event.target.value.trim() || undefined })
              }
              placeholder="Name or email"
            />
          </label>

          <label className="field-control">
            <span>Role</span>
            <select
              value={role ?? ""}
              onChange={(event) =>
                updateParams({
                  role: parseRole(event.target.value) ?? undefined
                })
              }
            >
              <option value="">All roles</option>
              {userRoles.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {formatEnum(roleOption)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-control">
            <span>Status</span>
            <select
              value={status ?? ""}
              onChange={(event) =>
                updateParams({
                  status: parseStatus(event.target.value) ?? undefined
                })
              }
            >
              <option value="">All statuses</option>
              {userStatuses.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {formatEnum(statusOption)}
                </option>
              ))}
            </select>
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
            <button className="button button-secondary" type="button" onClick={clearFilters}>
              Clear filters
            </button>
          ) : null}
        </form>

        {state.status === "loading" ? (
          <LoadingState label="Loading users" />
        ) : null}

        {state.status === "error" ? (
          <ErrorState message={state.error} />
        ) : null}

        {state.status === "success" && rows.length === 0 ? (
          <EmptyState message="No users match this report view." />
        ) : null}

        {state.status === "success" && rows.length > 0 ? (
          <>
            <div className="table-frame">
              <table className="report-table">
                <thead>
                  <tr>
                    {columnHeaders.map((column) => {
                      const active = sort.field === column.field;
                      return (
                        <th
                          key={column.field}
                          scope="col"
                          className={column.align === "right" ? "align-right" : undefined}
                          aria-sort={
                            active
                              ? sort.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            className="table-sort-button"
                            type="button"
                            onClick={() => changeSort(column.field)}
                          >
                            {column.label}
                            {active ? (
                              sort.direction === "asc" ? (
                                <ArrowUp size={14} aria-label="sorted ascending" />
                              ) : (
                                <ArrowDown size={14} aria-label="sorted descending" />
                              )
                            ) : (
                              <ChevronsUpDown size={14} aria-hidden="true" />
                            )}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((user) => (
                    <tr key={user.id}>
                      <td className="align-right">{user.id}</td>
                      <td>{user.name}</td>
                      <td>
                        <a href={`mailto:${user.email}`}>{user.email}</a>
                      </td>
                      <td>{formatEnum(user.role)}</td>
                      <td>
                        <span className={`status-pill ${statusTone(user.status)}`}>
                          {formatEnum(user.status)}
                        </span>
                      </td>
                      <td>{formatCreatedAt(user.createdAt)}</td>
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

function parseRole(value: string | null): UserRole | undefined {
  return userRoles.includes(value as UserRole) ? (value as UserRole) : undefined;
}

function parseStatus(value: string | null): UserStatus | undefined {
  return userStatuses.includes(value as UserStatus)
    ? (value as UserStatus)
    : undefined;
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
    sortableFields.includes(field as UserSortField) &&
    (direction === "asc" || direction === "desc")
  ) {
    return { field: field as UserSortField, direction };
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

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function statusTone(status: UserStatus) {
  if (status === "ACTIVE") {
    return "status-success";
  }

  if (status === "ON_LEAVE") {
    return "status-warning";
  }

  return "status-muted";
}
