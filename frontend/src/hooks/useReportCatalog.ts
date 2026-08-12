import { useCallback, useEffect, useState } from "react";
import { fetchReportCatalog } from "../services/reportDataSource";
import type { AsyncState, ReportCatalogItem } from "../types/reporting";

export function useReportCatalog() {
  const [state, setState] = useState<AsyncState<ReportCatalogItem[]>>({
    status: "loading"
  });

  const loadCatalog = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const reports = await fetchReportCatalog();
      setState({ status: "success", data: reports });
    } catch (error) {
      setState({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Report catalog is unavailable."
      });
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return {
    ...state,
    reload: loadCatalog
  };
}

