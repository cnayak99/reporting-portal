import { ReportRoutePlaceholder } from "../../components/ReportRoutePlaceholder";

export function ProjectReportPage() {
  return (
    <ReportRoutePlaceholder
      title="Projects report"
      description="Active and past work with department, owner, status, start date, and end date."
      endpoint="/api/reports/projects"
      columns={[
        "Project ID",
        "Project Name",
        "Department",
        "Owner",
        "Status",
        "Start Date",
        "End Date"
      ]}
    />
  );
}

