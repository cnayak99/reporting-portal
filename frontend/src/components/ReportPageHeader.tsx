import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ReportPageHeaderProps {
  kicker: string;
  title: string;
  description: string;
}

export function ReportPageHeader({
  kicker,
  title,
  description
}: ReportPageHeaderProps) {
  return (
    <section className="report-page-header">
      <Link className="back-link" to="/">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Reports
      </Link>
      <div>
        <span className="section-kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

