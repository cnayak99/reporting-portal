import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { formatCellValue } from "../lib/reportView";
import type {
  ColumnDefinition,
  ReportRecord,
  SortState
} from "../types/reporting";
import { StatusBadge } from "./StatusBadge";

interface DataTableProps {
  columns: ColumnDefinition[];
  rows: ReportRecord[];
  sort: SortState;
  onSort: (columnKey: string) => void;
}

export function DataTable({ columns, rows, sort, onSort }: DataTableProps) {
  return (
    <div className="table-frame">
      <table className="report-table">
        <thead>
          <tr>
            {columns.map((column) => {
              const isActiveSort = sort.key === column.key;

              return (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.align ? `align-${column.align}` : undefined}
                  aria-sort={
                    isActiveSort
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  scope="col"
                >
                  {column.sortable ? (
                    <button
                      className="table-sort-button"
                      type="button"
                      onClick={() => onSort(column.key)}
                    >
                      {column.label}
                      {isActiveSort ? (
                        sort.direction === "asc" ? (
                          <ArrowUp size={14} aria-hidden="true" />
                        ) : (
                          <ArrowDown size={14} aria-hidden="true" />
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
          {rows.map((row, rowIndex) => (
            <tr key={getRowKey(row, rowIndex)}>
              {columns.map((column) => (
                <td
                  key={`${getRowKey(row, rowIndex)}-${column.key}`}
                  className={column.align ? `align-${column.align}` : undefined}
                >
                  {renderCell(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(row: ReportRecord, column: ColumnDefinition) {
  const value = row[column.key];

  if (column.variant === "status" && typeof value === "string") {
    return <StatusBadge value={value} />;
  }

  if (column.variant === "email" && typeof value === "string") {
    return (
      <a className="table-email" href={`mailto:${value}`}>
        {value}
      </a>
    );
  }

  return formatCellValue(value, column);
}

function getRowKey(row: ReportRecord, index: number) {
  return String(
    row.userId ?? row.departmentId ?? row.projectId ?? row.id ?? index
  );
}

