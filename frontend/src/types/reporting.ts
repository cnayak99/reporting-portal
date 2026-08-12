export type ReportId = "users" | "departments" | "projects";

export type ReportCellValue = string | number | null;

export type ReportRecord = Record<string, ReportCellValue>;

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

export type ColumnVariant = "text" | "number" | "email" | "date" | "status";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface ColumnDefinition<T extends ReportRecord = ReportRecord> {
  key: keyof T & string;
  label: string;
  variant?: ColumnVariant;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
}

export interface UserReportRow extends ReportRecord {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  createdDate: string;
}

export interface DepartmentReportRow extends ReportRecord {
  departmentId: number;
  departmentName: string;
  manager: string | null;
  employeeCount: number;
  location: string;
  activeProjects: number;
}

export interface ProjectReportRow extends ReportRecord {
  projectId: number;
  projectName: string;
  department: string;
  owner: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
}

export interface ReportDefinition {
  id: ReportId;
  name: string;
  eyebrow: string;
  description: string;
  accent: "teal" | "coral" | "gold";
  icon: ReportId;
  lastUpdated: string;
  refreshCadence: string;
  steward: string;
  signal: string;
  columns: ColumnDefinition[];
}

export interface ReportCatalogItem extends ReportDefinition {
  rowCount: number;
  columnCount: number;
}

export type AsyncState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: string };
