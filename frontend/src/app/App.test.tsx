import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";
import type { ReportMetadata } from "../api/types";

const catalogReports: ReportMetadata[] = [
  {
    id: "users",
    name: "Users",
    description: "People in the system.",
    endpoint: "/api/reports/users"
  },
  {
    id: "departments",
    name: "Departments",
    description: "Organization structure.",
    endpoint: "/api/reports/departments"
  },
  {
    id: "projects",
    name: "Projects",
    description: "Active and past work.",
    endpoint: "/api/reports/projects"
  }
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AppShell", () => {
  it("shows a loading state while the report catalog is requested", () => {
    mockPendingCatalog();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading reports")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/reports",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("renders report cards from the backend catalog", async () => {
    mockCatalogResponse(catalogReports);
    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Users" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Departments" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open Projects report" })
    ).toHaveAttribute("href", "/reports/projects");
  });

  it("filters reports by name with trimmed case-insensitive search", async () => {
    mockCatalogResponse(catalogReports);
    renderApp();
    await screen.findByRole("heading", { name: "Users" });

    fireEvent.change(screen.getByLabelText("Search reports by name"), {
      target: { value: " users " }
    });

    expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Departments" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Projects" })
    ).not.toBeInTheDocument();
  });

  it("shows a useful state when no reports match the search", async () => {
    mockCatalogResponse(catalogReports);
    renderApp();
    await screen.findByRole("heading", { name: "Users" });

    fireEvent.change(screen.getByLabelText("Search reports by name"), {
      target: { value: "finance" }
    });

    expect(screen.getByText('No reports match "finance".')).toBeInTheDocument();
  });

  it("shows an empty state when the backend returns no reports", async () => {
    mockCatalogResponse([]);
    renderApp();

    expect(
      await screen.findByText("No reports are available yet.")
    ).toBeInTheDocument();
  });

  it("shows an error state when the catalog request fails", async () => {
    mockCatalogFailure("Database unavailable.");
    renderApp();

    expect(await screen.findByText("Database unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("retries the catalog request after a failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(problemResponse("Database unavailable."))
      .mockResolvedValueOnce(jsonResponse(catalogReports));
    vi.stubGlobal("fetch", fetchMock);
    renderApp();

    await screen.findByText("Database unavailable.");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("heading", { name: "Users" })
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("navigates from a report card to the matching report route", async () => {
    mockCatalogResponse(catalogReports);
    renderApp();

    fireEvent.click(await screen.findByRole("link", { name: "Open Users report" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Users report" })
      ).toBeInTheDocument();
    });
  });
});

function renderApp() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AppShell />
    </MemoryRouter>
  );
}

function mockPendingCatalog() {
  vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => undefined)));
}

function mockCatalogResponse(reports: ReportMetadata[]) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(reports)));
}

function mockCatalogFailure(detail: string) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(problemResponse(detail)));
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

function problemResponse(detail: string) {
  return new Response(
    JSON.stringify({
      title: "Service unavailable",
      status: 503,
      detail,
      code: "DATABASE_UNAVAILABLE"
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/problem+json" }
    }
  );
}
