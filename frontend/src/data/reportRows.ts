import type {
  ColumnDefinition,
  DepartmentReportRow,
  ProjectReportRow,
  ReportDefinition,
  ReportId,
  ReportRecord,
  UserReportRow
} from "../types/reporting";

export const userRows: UserReportRow[] = [
  {
    userId: 1001,
    name: "Avery Chen",
    email: "avery.chen@enfos.example",
    role: "MANAGER",
    status: "ACTIVE",
    department: "Engineering",
    createdDate: "2024-01-15"
  },
  {
    userId: 1002,
    name: "Mina Patel",
    email: "mina.patel@enfos.example",
    role: "ANALYST",
    status: "ACTIVE",
    department: "Product",
    createdDate: "2024-02-02"
  },
  {
    userId: 1003,
    name: "Jon Bell",
    email: "jon.bell@enfos.example",
    role: "ENGINEER",
    status: "ACTIVE",
    department: "Engineering",
    createdDate: "2024-02-28"
  },
  {
    userId: 1004,
    name: "Leah Brooks",
    email: "leah.brooks@enfos.example",
    role: "OPERATIONS",
    status: "ON_LEAVE",
    department: "Customer Operations",
    createdDate: "2024-03-12"
  },
  {
    userId: 1005,
    name: "Owen Martin",
    email: "owen.martin@enfos.example",
    role: "ADMIN",
    status: "ACTIVE",
    department: "Information Systems",
    createdDate: "2024-03-29"
  },
  {
    userId: 1006,
    name: "Sofia Reyes",
    email: "sofia.reyes@enfos.example",
    role: "MANAGER",
    status: "ACTIVE",
    department: "Finance",
    createdDate: "2024-04-04"
  },
  {
    userId: 1007,
    name: "Elliot Hughes",
    email: "elliot.hughes@enfos.example",
    role: "ANALYST",
    status: "INACTIVE",
    department: "Finance",
    createdDate: "2024-04-18"
  },
  {
    userId: 1008,
    name: "Nora Kim",
    email: "nora.kim@enfos.example",
    role: "ENGINEER",
    status: "ACTIVE",
    department: "Engineering",
    createdDate: "2024-05-03"
  },
  {
    userId: 1009,
    name: "Theo James",
    email: "theo.james@enfos.example",
    role: "OPERATIONS",
    status: "ACTIVE",
    department: "Customer Operations",
    createdDate: "2024-05-20"
  },
  {
    userId: 1010,
    name: "Priya Shah",
    email: "priya.shah@enfos.example",
    role: "MANAGER",
    status: "ACTIVE",
    department: "Product",
    createdDate: "2024-06-06"
  },
  {
    userId: 1011,
    name: "Marcus Lee",
    email: "marcus.lee@enfos.example",
    role: "ENGINEER",
    status: "ACTIVE",
    department: "Information Systems",
    createdDate: "2024-06-21"
  },
  {
    userId: 1012,
    name: "Iris Novak",
    email: "iris.novak@enfos.example",
    role: "ANALYST",
    status: "ACTIVE",
    department: "Data Office",
    createdDate: "2024-07-09"
  }
];

export const departmentRows: DepartmentReportRow[] = [
  {
    departmentId: 201,
    departmentName: "Engineering",
    manager: "Avery Chen",
    employeeCount: 36,
    location: "Chicago, IL",
    activeProjects: 8
  },
  {
    departmentId: 202,
    departmentName: "Product",
    manager: "Priya Shah",
    employeeCount: 18,
    location: "Austin, TX",
    activeProjects: 5
  },
  {
    departmentId: 203,
    departmentName: "Finance",
    manager: "Sofia Reyes",
    employeeCount: 12,
    location: "New York, NY",
    activeProjects: 2
  },
  {
    departmentId: 204,
    departmentName: "Customer Operations",
    manager: "Leah Brooks",
    employeeCount: 27,
    location: "Denver, CO",
    activeProjects: 4
  },
  {
    departmentId: 205,
    departmentName: "Information Systems",
    manager: "Owen Martin",
    employeeCount: 14,
    location: "Seattle, WA",
    activeProjects: 6
  },
  {
    departmentId: 206,
    departmentName: "Data Office",
    manager: "Iris Novak",
    employeeCount: 9,
    location: "Boston, MA",
    activeProjects: 3
  }
];

export const projectRows: ProjectReportRow[] = [
  {
    projectId: 3001,
    projectName: "Reporting Portal",
    department: "Engineering",
    owner: "Avery Chen",
    status: "ACTIVE",
    startDate: "2026-07-20",
    endDate: null
  },
  {
    projectId: 3002,
    projectName: "Invoice Reconciliation",
    department: "Finance",
    owner: "Sofia Reyes",
    status: "ACTIVE",
    startDate: "2026-05-12",
    endDate: null
  },
  {
    projectId: 3003,
    projectName: "Customer Health Signals",
    department: "Customer Operations",
    owner: "Theo James",
    status: "PLANNED",
    startDate: "2026-09-01",
    endDate: null
  },
  {
    projectId: 3004,
    projectName: "Data Quality Workbench",
    department: "Data Office",
    owner: "Iris Novak",
    status: "ACTIVE",
    startDate: "2026-04-22",
    endDate: null
  },
  {
    projectId: 3005,
    projectName: "Entitlement Review",
    department: "Information Systems",
    owner: "Owen Martin",
    status: "ON_HOLD",
    startDate: "2026-03-03",
    endDate: null
  },
  {
    projectId: 3006,
    projectName: "Portfolio Planning",
    department: "Product",
    owner: "Priya Shah",
    status: "COMPLETED",
    startDate: "2025-11-18",
    endDate: "2026-02-14"
  },
  {
    projectId: 3007,
    projectName: "Release Readiness",
    department: "Engineering",
    owner: "Nora Kim",
    status: "ACTIVE",
    startDate: "2026-06-10",
    endDate: null
  },
  {
    projectId: 3008,
    projectName: "Vendor Risk Refresh",
    department: "Information Systems",
    owner: "Marcus Lee",
    status: "CANCELLED",
    startDate: "2025-10-01",
    endDate: "2026-01-17"
  },
  {
    projectId: 3009,
    projectName: "Usage Forecast",
    department: "Data Office",
    owner: "Mina Patel",
    status: "ACTIVE",
    startDate: "2026-01-26",
    endDate: null
  },
  {
    projectId: 3010,
    projectName: "Support Queue Modernization",
    department: "Customer Operations",
    owner: "Leah Brooks",
    status: "PLANNED",
    startDate: "2026-10-05",
    endDate: null
  }
];

const userColumns: ColumnDefinition[] = [
  { key: "userId", label: "User ID", variant: "number", align: "right", sortable: true, width: "92px" },
  { key: "name", label: "Name", sortable: true, width: "170px" },
  { key: "email", label: "Email", variant: "email", sortable: true, width: "240px" },
  { key: "role", label: "Role", sortable: true, width: "130px" },
  { key: "status", label: "Status", variant: "status", sortable: true, width: "130px" },
  { key: "createdDate", label: "Created Date", variant: "date", sortable: true, width: "140px" }
];

const departmentColumns: ColumnDefinition[] = [
  { key: "departmentId", label: "Department ID", variant: "number", align: "right", sortable: true, width: "130px" },
  { key: "departmentName", label: "Department Name", sortable: true, width: "210px" },
  { key: "manager", label: "Manager", sortable: true, width: "170px" },
  { key: "employeeCount", label: "Employee Count", variant: "number", align: "right", sortable: true, width: "160px" },
  { key: "location", label: "Location", sortable: true, width: "170px" },
  { key: "activeProjects", label: "Active Projects", variant: "number", align: "right", sortable: true, width: "150px" }
];

const projectColumns: ColumnDefinition[] = [
  { key: "projectId", label: "Project ID", variant: "number", align: "right", sortable: true, width: "105px" },
  { key: "projectName", label: "Project Name", sortable: true, width: "230px" },
  { key: "department", label: "Department", sortable: true, width: "180px" },
  { key: "owner", label: "Owner", sortable: true, width: "160px" },
  { key: "status", label: "Status", variant: "status", sortable: true, width: "130px" },
  { key: "startDate", label: "Start Date", variant: "date", sortable: true, width: "135px" },
  { key: "endDate", label: "End Date", variant: "date", sortable: true, width: "135px" }
];

export const reportDefinitions: ReportDefinition[] = [
  {
    id: "users",
    name: "Users",
    eyebrow: "People in the system",
    description: "Review user identity, role, lifecycle status, and account creation trends.",
    accent: "teal",
    icon: "users",
    lastUpdated: "2026-08-11T14:05:00Z",
    refreshCadence: "Hourly",
    steward: "Information Systems",
    signal: "91 percent active",
    columns: userColumns
  },
  {
    id: "departments",
    name: "Departments",
    eyebrow: "Org structure",
    description: "See department ownership, location, staffing size, and operational footprint.",
    accent: "coral",
    icon: "departments",
    lastUpdated: "2026-08-11T13:40:00Z",
    refreshCadence: "Daily",
    steward: "People Operations",
    signal: "116 employees tracked",
    columns: departmentColumns
  },
  {
    id: "projects",
    name: "Projects",
    eyebrow: "Active and past work",
    description: "Track project ownership, department alignment, status, and delivery dates.",
    accent: "gold",
    icon: "projects",
    lastUpdated: "2026-08-11T14:18:00Z",
    refreshCadence: "Every 30 min",
    steward: "Program Office",
    signal: "6 in flight",
    columns: projectColumns
  }
];

export const reportRows: Record<ReportId, ReportRecord[]> = {
  users: userRows,
  departments: departmentRows,
  projects: projectRows
};
