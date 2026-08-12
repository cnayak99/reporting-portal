export type ReportId = "users" | "departments" | "projects";

export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "ANALYST"
  | "ENGINEER"
  | "OPERATIONS";

export type UserStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

export type ProjectStatus =
  | "PLANNED"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export interface ReportMetadata {
  id: ReportId;
  name: string;
  description: string;
  endpoint: string;
}

export interface PageMetadata {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  pagination: PageMetadata;
}

export interface UserReportRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface DepartmentReportRow {
  id: number;
  name: string;
  manager: string | null;
  employeeCount: number;
  location: string;
}

export interface ProjectReportRow {
  id: number;
  name: string;
  department: string;
  owner: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
}

export interface BackendProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  parameter?: string;
  [extension: string]: unknown;
}

