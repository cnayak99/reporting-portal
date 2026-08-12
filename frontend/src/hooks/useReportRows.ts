import { useCallback, useEffect, useState } from "react";
import { fetchReportRows } from "../services/reportDataSource";
import type { AsyncState, ReportId, ReportRecord } from "../types/reporting";

export function useReportRows(reportId: ReportId, shouldFail: boolean) {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<AsyncState<ReportRecord[]>>({
    status: "loading"
  });

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadRows() {
      setState({ status: "loading" });

      try {
        const rows = await fetchReportRows(reportId, { fail: shouldFail });

        if (isActive) {
          setState({ status: "success", data: rows });
        }
      } catch (error) {
        if (isActive) {
          setState({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Report data is unavailable."
          });
        }
      }
    }

    void loadRows();

    return () => {
      isActive = false;
    };
  }, [reportId, reloadToken, shouldFail]);

  return {
    ...state,
    reload
  };
}

