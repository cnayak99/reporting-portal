import { ArrowLeft, TableProperties } from "lucide-react";
import { Link } from "react-router-dom";

interface ReportRoutePlaceholderProps {
  title: string;
  description: string;
  endpoint: `/api${string}`;
  columns: string[];
}

export function ReportRoutePlaceholder({
  title,
  description,
  endpoint,
  columns
}: ReportRoutePlaceholderProps) {
  return (
    <section className="report-placeholder" aria-labelledby="report-title">
      <Link className="back-link" to="/">
        <ArrowLeft size={18} aria-hidden="true" />
        Catalog
      </Link>

      <div className="report-placeholder-header">
        <span className="section-kicker">Report route</span>
        <h1 id="report-title">{title}</h1>
        <p>{description}</p>
      </div>

      <div className="integration-card">
        <span className="state-icon">
          <TableProperties size={24} aria-hidden="true" />
        </span>
        <div>
          <h2>Table view starts in the next phase</h2>
          <p>
            This route is wired and ready to consume <code>{endpoint}</code>{" "}
            through the typed API client.
          </p>
        </div>
      </div>

      <section className="column-preview" aria-label={`${title} columns`}>
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </section>
    </section>
  );
}

