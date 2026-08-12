import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  UsersRound
} from "lucide-react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { NotFoundPage } from "../components/NotFoundPage";
import { CatalogPage } from "../features/catalog/CatalogPage";
import { DepartmentReportPage } from "../features/departments/DepartmentReportPage";
import { ProjectReportPage } from "../features/projects/ProjectReportPage";
import { UserReportPage } from "../features/users/UserReportPage";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand-link" to="/" aria-label="Reporting Portal home">
          <span className="brand-mark">
            <BarChart3 size={22} aria-hidden="true" />
          </span>
          <span>
            <strong>Reporting Portal</strong>
            <small>Internal reports</small>
          </span>
        </Link>

        <nav className="top-nav" aria-label="Primary navigation">
          <NavLink to="/" end>
            <LayoutDashboard size={18} aria-hidden="true" />
            Catalog
          </NavLink>
          <NavLink to="/reports/users">
            <UsersRound size={18} aria-hidden="true" />
            Users
          </NavLink>
          <NavLink to="/reports/departments">
            <Building2 size={18} aria-hidden="true" />
            Departments
          </NavLink>
          <NavLink to="/reports/projects">
            <ClipboardList size={18} aria-hidden="true" />
            Projects
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/reports/users" element={<UserReportPage />} />
          <Route path="/reports/departments" element={<DepartmentReportPage />} />
          <Route path="/reports/projects" element={<ProjectReportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

