import { reportDefinitions, reportRows } from "../data/reportRows";
import type {
  ReportCatalogItem,
  ReportId,
  ReportRecord
} from "../types/reporting";

interface DataSourceOptions {
  fail?: boolean;
}

const RESPONSE_DELAY_MS = 520;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cloneRows<T extends ReportRecord>(rows: T[]): T[] {
  return rows.map((row) => ({ ...row }));
}

function buildCatalog(): ReportCatalogItem[] {
  return reportDefinitions.map((report) => ({
    ...report,
    rowCount: reportRows[report.id].length,
    columnCount: report.columns.length
  }));
}

export async function fetchReportCatalog(
  options: DataSourceOptions = {}
): Promise<ReportCatalogItem[]> {
  await wait(RESPONSE_DELAY_MS);

  if (options.fail) {
    throw new Error("Report catalog is unavailable.");
  }

  return buildCatalog();
}

export async function fetchReportRows<T extends ReportRecord = ReportRecord>(
  reportId: ReportId,
  options: DataSourceOptions = {}
): Promise<T[]> {
  await wait(RESPONSE_DELAY_MS);

  if (options.fail) {
    throw new Error("Report data is unavailable.");
  }

  return cloneRows(reportRows[reportId] as T[]);
}

