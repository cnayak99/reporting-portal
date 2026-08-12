import { requestJson } from "./apiClient";
import type {
  DepartmentReportRow,
  PagedResponse,
  ProjectReportRow,
  ReportMetadata,
  UserRole,
  UserReportRow,
  UserStatus
} from "./types";

export interface UsersReportParams {
  q?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export function getReportCatalog(signal?: AbortSignal) {
  return requestJson<ReportMetadata[]>("/api/reports", { signal });
}

export function getUsersReport(
  params: UsersReportParams = {},
  signal?: AbortSignal
) {
  return requestJson<PagedResponse<UserReportRow>>(
    withSearchParams("/api/reports/users", params),
    { signal }
  );
}

export function getDepartmentsReport(signal?: AbortSignal) {
  return requestJson<PagedResponse<DepartmentReportRow>>(
    "/api/reports/departments",
    { signal }
  );
}

export function getProjectsReport(signal?: AbortSignal) {
  return requestJson<PagedResponse<ProjectReportRow>>("/api/reports/projects", {
    signal
  });
}

function withSearchParams(
  path: `/api${string}`,
  params: object
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      (typeof value === "string" || typeof value === "number") &&
      value !== ""
    ) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? (`${path}?${query}` as `/api${string}`) : path;
}
