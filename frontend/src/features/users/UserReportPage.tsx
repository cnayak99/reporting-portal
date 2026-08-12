import { ReportRoutePlaceholder } from "../../components/ReportRoutePlaceholder";

export function UserReportPage() {
  return (
    <ReportRoutePlaceholder
      title="Users report"
      description="People in the system with identity, role, status, and account creation date."
      endpoint="/api/reports/users"
      columns={["User ID", "Name", "Email", "Role", "Status", "Created Date"]}
    />
  );
}

