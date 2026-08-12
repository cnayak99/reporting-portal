import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";
import type {
  PagedResponse,
  ReportMetadata,
  UserReportRow
} from "../api/types";

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
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("/api/reports/users")) {
          return Promise.resolve(jsonResponse(usersPage()));
        }
        return Promise.resolve(jsonResponse(catalogReports));
      })
    );
    renderApp();

    fireEvent.click(await screen.findByRole("link", { name: "Open Users report" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Users" })
      ).toBeInTheDocument();
    });
  });

  it("renders users report rows from the backend", async () => {
    const fetchMock = mockUsersResponse(usersPage());
    renderApp(["/reports/users"]);

    expect(await screen.findByText("Avery Chen")).toBeInTheDocument();
    expect(screen.getByText("avery.chen@example.com")).toBeInTheDocument();
    expect(screen.getByText("2 total results")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(getFetchSearchParam(fetchMock, 0, "sort")).toBe("name,asc");
  });

  it("shows a users loading state", () => {
    mockPendingCatalog();
    renderApp(["/reports/users"]);

    expect(screen.getByText("Loading users")).toBeInTheDocument();
  });

  it("shows a users error state", async () => {
    mockUsersFailure("Users report unavailable.");
    renderApp(["/reports/users"]);

    expect(await screen.findByText("Users report unavailable.")).toBeInTheDocument();
  });

  it("shows a users empty state", async () => {
    mockUsersResponse(usersPage([]));
    renderApp(["/reports/users"]);

    expect(
      await screen.findByText("No users match this report view.")
    ).toBeInTheDocument();
  });

  it("sends q and resets to page zero when searching users", async () => {
    const fetchMock = mockUsersResponse(usersPage());
    renderApp(["/reports/users?page=2"]);
    await screen.findByText("Avery Chen");

    fireEvent.change(screen.getByLabelText("Search users"), {
      target: { value: " avery " }
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "q")).toBe("avery");
    expect(getFetchSearchParam(fetchMock, 1, "page")).toBe("0");
  });

  it("sends the selected role filter and resets to page zero", async () => {
    const fetchMock = mockUsersResponse(usersPage());
    renderApp(["/reports/users?page=3"]);
    await screen.findByText("Avery Chen");

    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "MANAGER" }
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "role")).toBe("MANAGER");
    expect(getFetchSearchParam(fetchMock, 1, "page")).toBe("0");
  });

  it("sends the selected status filter and resets to page zero", async () => {
    const fetchMock = mockUsersResponse(usersPage());
    renderApp(["/reports/users?page=1"]);
    await screen.findByText("Avery Chen");

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "ACTIVE" }
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "status")).toBe("ACTIVE");
    expect(getFetchSearchParam(fetchMock, 1, "page")).toBe("0");
  });

  it("uses backend pagination metadata for next page navigation", async () => {
    const fetchMock = mockUsersResponse(
      usersPage(sampleUsers, {
        page: 0,
        size: 25,
        totalItems: 30,
        totalPages: 2,
        hasNext: true,
        hasPrevious: false
      })
    );
    renderApp(["/reports/users"]);
    await screen.findByText("Avery Chen");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "page")).toBe("1");
  });

  it("sends only allowlisted user sort fields and shows direction", async () => {
    const fetchMock = mockUsersResponse(usersPage());
    renderApp(["/reports/users?sort=madeUp,desc"]);
    await screen.findByText("Avery Chen");

    expect(getFetchSearchParam(fetchMock, 0, "sort")).toBe("name,asc");
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending"
    );

    fireEvent.click(screen.getByRole("button", { name: /Email/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "sort")).toBe("email,asc");
  });

  it("navigates back from users to the report catalog", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("/api/reports/users")) {
          return Promise.resolve(jsonResponse(usersPage()));
        }
        return Promise.resolve(jsonResponse(catalogReports));
      })
    );
    renderApp(["/reports/users"]);
    await screen.findByText("Avery Chen");

    fireEvent.click(screen.getByRole("link", { name: "Back to Reports" }));

    expect(
      await screen.findByRole("heading", { name: "Available reports" })
    ).toBeInTheDocument();
  });
});

const sampleUsers: UserReportRow[] = [
  {
    id: 1001,
    name: "Avery Chen",
    email: "avery.chen@example.com",
    role: "MANAGER",
    status: "ACTIVE",
    createdAt: "2026-01-15T15:30:00Z"
  },
  {
    id: 1002,
    name: "Blair Stone",
    email: "blair.stone@example.com",
    role: "ANALYST",
    status: "ON_LEAVE",
    createdAt: "2026-02-20T18:45:00Z"
  }
];

function renderApp(initialEntries = ["/"]) {
  render(
    <MemoryRouter initialEntries={initialEntries}>
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

function mockUsersResponse(page: PagedResponse<UserReportRow>) {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(page));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockUsersFailure(detail: string) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(problemResponse(detail)));
}

function usersPage(
  items: UserReportRow[] = sampleUsers,
  pagination = {
    page: 0,
    size: 25,
    totalItems: items.length,
    totalPages: items.length === 0 ? 0 : 1,
    hasNext: false,
    hasPrevious: false
  }
): PagedResponse<UserReportRow> {
  return { items, pagination };
}

function getFetchSearchParam(
  fetchMock: ReturnType<typeof vi.fn>,
  callIndex: number,
  parameter: string
) {
  const path = String(fetchMock.mock.calls[callIndex][0]);
  return new URL(path, "http://localhost").searchParams.get(parameter);
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
