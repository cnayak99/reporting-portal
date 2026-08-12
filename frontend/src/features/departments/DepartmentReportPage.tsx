import { ReportRoutePlaceholder } from "../../components/ReportRoutePlaceholder";

export function DepartmentReportPage() {
  return (
    <ReportRoutePlaceholder
      title="Departments report"
      description="Organization structure with department manager, employee count, and location."
      endpoint="/api/reports/departments"
      columns={[
        "Department ID",
        "Department Name",
        "Manager",
        "Employee Count",
        "Location"
      ]}
    />
  );
}

