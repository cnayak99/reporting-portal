import { requestJson } from "./apiClient";
import type {
  DepartmentReportRow,
  PagedResponse,
  ProjectReportRow,
  ReportMetadata,
  UserReportRow
} from "./types";

export function getReportCatalog(signal?: AbortSignal) {
  return requestJson<ReportMetadata[]>("/api/reports", { signal });
}

export function getUsersReport(signal?: AbortSignal) {
  return requestJson<PagedResponse<UserReportRow>>("/api/reports/users", {
    signal
  });
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

