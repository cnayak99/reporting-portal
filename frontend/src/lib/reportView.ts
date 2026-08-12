import type {
  ColumnDefinition,
  ReportRecord,
  SortDirection,
  SortState
} from "../types/reporting";

export function formatDate(value: ReportRecord[string]) {
  if (!value) {
    return "Open";
  }

  const rawValue = String(value);
  const dateOnlyMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3])
      )
    : new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatCellValue(
  value: ReportRecord[string],
  column: ColumnDefinition
) {
  if (column.variant === "date") {
    return formatDate(value);
  }

  if (column.variant === "number" && typeof value === "number") {
    return new Intl.NumberFormat("en").format(value);
  }

  if (value === null || value === undefined || value === "") {
    return "Unassigned";
  }

  if (typeof value === "string" && /^[A-Z_]+$/.test(value)) {
    return formatStatus(value);
  }

  return String(value);
}

export function getSearchText(row: ReportRecord) {
  return Object.values(row)
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();
}

export function compareReportRows(
  key: string,
  direction: SortDirection
): (left: ReportRecord, right: ReportRecord) => number {
  return (left, right) => {
    const leftValue = left[key];
    const rightValue = right[key];
    const multiplier = direction === "asc" ? 1 : -1;

    if (leftValue === rightValue) {
      return 0;
    }

    if (leftValue === null || leftValue === undefined) {
      return 1;
    }

    if (rightValue === null || rightValue === undefined) {
      return -1;
    }

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * multiplier;
    }

    const leftDate = Date.parse(String(leftValue));
    const rightDate = Date.parse(String(rightValue));

    if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
      return (leftDate - rightDate) * multiplier;
    }

    return (
      String(leftValue).localeCompare(String(rightValue), "en", {
        numeric: true,
        sensitivity: "base"
      }) * multiplier
    );
  };
}

export function applyReportView(
  rows: ReportRecord[],
  query: string,
  statusFilter: string,
  departmentFilter: string,
  sort: SortState
) {
  const normalizedQuery = query.trim().toLowerCase();

  return rows
    .filter((row) =>
      normalizedQuery.length === 0
        ? true
        : getSearchText(row).includes(normalizedQuery)
    )
    .filter((row) =>
      statusFilter === "all" ? true : String(row.status) === statusFilter
    )
    .filter((row) =>
      departmentFilter === "all"
        ? true
        : String(row.department) === departmentFilter
    )
    .sort(compareReportRows(sort.key, sort.direction));
}

export function getFacetValues(rows: ReportRecord[], key: string) {
  return Array.from(
    new Set(
      rows
        .map((row) => row[key])
        .filter((value): value is string | number => value !== null)
        .map(String)
    )
  ).sort((left, right) => left.localeCompare(right, "en"));
}

export function getDefaultSort(columns: ColumnDefinition[]): SortState {
  const firstSortable = columns.find((column) => column.sortable);

  return {
    key: firstSortable?.key ?? columns[0]?.key ?? "id",
    direction: "asc"
  };
}

export function toCsv(columns: ColumnDefinition[], rows: ReportRecord[]) {
  const header = columns.map((column) => escapeCsv(column.label)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((column) => escapeCsv(formatCellValue(row[column.key], column)))
        .join(",")
    )
    .join("\n");

  return `${header}\n${body}`;
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}
