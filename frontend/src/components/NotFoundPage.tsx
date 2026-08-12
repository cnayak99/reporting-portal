import { DatabaseZap } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="state-panel">
      <span className="state-icon">
        <DatabaseZap size={24} aria-hidden="true" />
      </span>
      <h1>Page not found</h1>
      <p>The route you opened is not part of the reporting portal.</p>
      <Link className="button button-primary" to="/">
        Back to catalog
      </Link>
    </section>
  );
}

