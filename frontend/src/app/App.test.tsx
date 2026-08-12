import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";
import type {
  DepartmentReportRow,
  PagedResponse,
  ProjectReportRow,
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

  it("retries the users report after an error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(problemResponse("Users report unavailable."))
      .mockResolvedValueOnce(jsonResponse(usersPage()));
    vi.stubGlobal("fetch", fetchMock);
    renderApp(["/reports/users"]);

    expect(await screen.findByText("Users report unavailable.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Avery Chen")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
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

  it("allows spaces while typing a users search phrase", async () => {
    const fetchMock = mockUsersResponse(usersPage());
    renderApp(["/reports/users"]);
    await screen.findByText("Avery Chen");

    const searchInput = screen.getByLabelText("Search users");
    fireEvent.change(searchInput, { target: { value: "Ben" } });
    expect(searchInput).toHaveValue("Ben");

    fireEvent.change(searchInput, { target: { value: "Ben " } });
    expect(searchInput).toHaveValue("Ben ");

    fireEvent.change(searchInput, { target: { value: "Ben Foster" } });
    expect(searchInput).toHaveValue("Ben Foster");

    await waitFor(() =>
      expect(getLatestFetchSearchParam(fetchMock, "q")).toBe("Ben Foster")
    );
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

  it("renders departments report rows from the backend", async () => {
    const fetchMock = mockDepartmentsResponse(departmentsPage());
    renderApp(["/reports/departments"]);

    expect(await screen.findByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Avery Chen")).toBeInTheDocument();
    expect(screen.getByText("2 total results")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(getFetchSearchParam(fetchMock, 0, "sort")).toBe("name,asc");
  });

  it("renders departments with zero employees normally", async () => {
    mockDepartmentsResponse(departmentsPage());
    renderApp(["/reports/departments"]);

    await screen.findByText("Operations");
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders null department managers clearly", async () => {
    mockDepartmentsResponse(departmentsPage());
    renderApp(["/reports/departments"]);

    expect(await screen.findByText("Unassigned")).toBeInTheDocument();
  });

  it("sends q and resets departments to page zero when searching", async () => {
    const fetchMock = mockDepartmentsResponse(departmentsPage());
    renderApp(["/reports/departments?page=2"]);
    await screen.findByText("Engineering");

    fireEvent.change(screen.getByLabelText("Search departments"), {
      target: { value: " engineering " }
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "q")).toBe("engineering");
    expect(getFetchSearchParam(fetchMock, 1, "page")).toBe("0");
  });

  it("sends location and resets departments to page zero when filtering", async () => {
    const fetchMock = mockDepartmentsResponse(departmentsPage());
    renderApp(["/reports/departments?page=3"]);
    await screen.findByText("Engineering");

    fireEvent.change(screen.getByLabelText("Location"), {
      target: { value: " Chicago " }
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "location")).toBe("Chicago");
    expect(getFetchSearchParam(fetchMock, 1, "page")).toBe("0");
  });

  it("uses backend pagination metadata for departments", async () => {
    const fetchMock = mockDepartmentsResponse(
      departmentsPage(sampleDepartments, {
        page: 0,
        size: 25,
        totalItems: 28,
        totalPages: 2,
        hasNext: true,
        hasPrevious: false
      })
    );
    renderApp(["/reports/departments"]);
    await screen.findByText("Engineering");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "page")).toBe("1");
  });

  it("exposes only backend-supported department sorting", async () => {
    const fetchMock = mockDepartmentsResponse(departmentsPage());
    renderApp(["/reports/departments?sort=employeeCount,desc"]);
    await screen.findByText("Engineering");

    expect(getFetchSearchParam(fetchMock, 0, "sort")).toBe("name,asc");
    expect(
      screen.getByRole("columnheader", { name: /Department Name/ })
    ).toHaveAttribute("aria-sort", "ascending");
    expect(
      screen.queryByRole("button", { name: /Employee Count/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Manager/ })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Location/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getFetchSearchParam(fetchMock, 1, "sort")).toBe("location,asc");
  });

  it("shows a departments error state with retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(problemResponse("Departments report unavailable."))
      .mockResolvedValueOnce(jsonResponse(departmentsPage()));
    vi.stubGlobal("fetch", fetchMock);
    renderApp(["/reports/departments"]);

    expect(
      await screen.findByText("Departments report unavailable.")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Engineering")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows a departments empty state", async () => {
    mockDepartmentsResponse(departmentsPage([]));
    renderApp(["/reports/departments"]);

    expect(
      await screen.findByText("No departments match this report view.")
    ).toBeInTheDocument();
  });

  it("navigates back from departments to the report catalog", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("/api/reports/departments")) {
          return Promise.resolve(jsonResponse(departmentsPage()));
        }
        return Promise.resolve(jsonResponse(catalogReports));
      })
    );
    renderApp(["/reports/departments"]);
    await screen.findByText("Engineering");

    fireEvent.click(screen.getByRole("link", { name: "Back to Reports" }));

    expect(
      await screen.findByRole("heading", { name: "Available reports" })
    ).toBeInTheDocument();
  });

  it("renders projects report rows from the backend", async () => {
    const fetchMock = mockProjectsResponse(projectsPage());
    renderApp(["/reports/projects"]);

    expect(await screen.findByText("Reporting Portal")).toBeInTheDocument();
    expect(screen.getAllByText("Engineering").length).toBeGreaterThan(0);
    expect(screen.getByText("Avery Chen")).toBeInTheDocument();
    expect(screen.getByText("2 total results")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 0, "sort")
    ).toBe("name,asc");
  });

  it("renders null project end dates as ongoing", async () => {
    mockProjectsResponse(projectsPage());
    renderApp(["/reports/projects"]);

    expect(await screen.findByText("Ongoing")).toBeInTheDocument();
  });

  it("sends q and resets projects to page zero when searching", async () => {
    const fetchMock = mockProjectsResponse(projectsPage());
    renderApp(["/reports/projects?page=2"]);
    await screen.findByText("Reporting Portal");

    fireEvent.change(screen.getByLabelText("Search projects"), {
      target: { value: " portal " }
    });

    await waitFor(() =>
      expect(countFetchesForPath(fetchMock, "/api/reports/projects")).toBe(2)
    );
    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 1, "q")
    ).toBe("portal");
    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 1, "page")
    ).toBe("0");
  });

  it("sends the selected project status filter", async () => {
    const fetchMock = mockProjectsResponse(projectsPage());
    renderApp(["/reports/projects?page=1"]);
    await screen.findByText("Reporting Portal");

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "ACTIVE" }
    });

    await waitFor(() =>
      expect(countFetchesForPath(fetchMock, "/api/reports/projects")).toBe(2)
    );
    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 1, "status")
    ).toBe("ACTIVE");
    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 1, "page")
    ).toBe("0");
  });

  it("uses department names as filter options and sends department IDs", async () => {
    const fetchMock = mockProjectsResponse(projectsPage());
    renderApp(["/reports/projects?page=3"]);
    await screen.findByText("Reporting Portal");
    await screen.findByRole("option", { name: "Engineering" });

    fireEvent.change(screen.getByLabelText("Department"), {
      target: { value: "201" }
    });

    await waitFor(() =>
      expect(countFetchesForPath(fetchMock, "/api/reports/projects")).toBe(2)
    );
    expect(
      getFetchSearchParamForPath(
        fetchMock,
        "/api/reports/projects",
        1,
        "departmentId"
      )
    ).toBe("201");
    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 1, "page")
    ).toBe("0");
  });

  it("uses backend pagination metadata for projects", async () => {
    const fetchMock = mockProjectsResponse(
      projectsPage(sampleProjects, {
        page: 0,
        size: 25,
        totalItems: 35,
        totalPages: 2,
        hasNext: true,
        hasPrevious: false
      })
    );
    renderApp(["/reports/projects"]);
    await screen.findByText("Reporting Portal");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() =>
      expect(countFetchesForPath(fetchMock, "/api/reports/projects")).toBe(2)
    );
    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 1, "page")
    ).toBe("1");
  });

  it("exposes only backend-supported project sorting", async () => {
    const fetchMock = mockProjectsResponse(projectsPage());
    renderApp(["/reports/projects?sort=department,desc"]);
    await screen.findByText("Reporting Portal");

    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 0, "sort")
    ).toBe("name,asc");
    expect(
      screen.getByRole("columnheader", { name: /Project Name/ })
    ).toHaveAttribute("aria-sort", "ascending");
    expect(
      screen.queryByRole("button", { name: /Department/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Owner/ })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /End Date/ }));

    await waitFor(() =>
      expect(countFetchesForPath(fetchMock, "/api/reports/projects")).toBe(2)
    );
    expect(
      getFetchSearchParamForPath(fetchMock, "/api/reports/projects", 1, "sort")
    ).toBe("endDate,asc");
  });

  it("shows a projects loading state", () => {
    mockProjectsPending();
    renderApp(["/reports/projects"]);

    expect(screen.getByText("Loading projects")).toBeInTheDocument();
  });

  it("shows a projects error state", async () => {
    mockProjectsFailure("Projects report unavailable.");
    renderApp(["/reports/projects"]);

    expect(
      await screen.findByText("Projects report unavailable.")
    ).toBeInTheDocument();
  });

  it("shows a projects empty state", async () => {
    mockProjectsResponse(projectsPage([]));
    renderApp(["/reports/projects"]);

    expect(
      await screen.findByText("No projects match this report view.")
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

const sampleDepartments: DepartmentReportRow[] = [
  {
    id: 201,
    name: "Engineering",
    manager: "Avery Chen",
    employeeCount: 36,
    location: "Chicago, IL"
  },
  {
    id: 202,
    name: "Operations",
    manager: null,
    employeeCount: 0,
    location: "Remote"
  }
];

const sampleProjects: ProjectReportRow[] = [
  {
    id: 3001,
    name: "Reporting Portal",
    department: "Engineering",
    owner: "Avery Chen",
    status: "ACTIVE",
    startDate: "2026-07-20",
    endDate: null
  },
  {
    id: 3002,
    name: "Portfolio Planning",
    department: "Operations",
    owner: "Blair Stone",
    status: "COMPLETED",
    startDate: "2026-01-15",
    endDate: "2026-06-30"
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

function mockDepartmentsResponse(page: PagedResponse<DepartmentReportRow>) {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(page));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockProjectsResponse(
  page: PagedResponse<ProjectReportRow>,
  departmentOptions: PagedResponse<DepartmentReportRow> = departmentsPage()
) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith("/api/reports/departments")) {
      return Promise.resolve(jsonResponse(departmentOptions));
    }

    return Promise.resolve(jsonResponse(page));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockProjectsPending() {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/api/reports/departments")) {
        return Promise.resolve(jsonResponse(departmentsPage()));
      }

      return new Promise<Response>(() => undefined);
    })
  );
}

function mockProjectsFailure(detail: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/api/reports/departments")) {
        return Promise.resolve(jsonResponse(departmentsPage()));
      }

      return Promise.resolve(problemResponse(detail));
    })
  );
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

function departmentsPage(
  items: DepartmentReportRow[] = sampleDepartments,
  pagination = {
    page: 0,
    size: 25,
    totalItems: items.length,
    totalPages: items.length === 0 ? 0 : 1,
    hasNext: false,
    hasPrevious: false
  }
): PagedResponse<DepartmentReportRow> {
  return { items, pagination };
}

function projectsPage(
  items: ProjectReportRow[] = sampleProjects,
  pagination = {
    page: 0,
    size: 25,
    totalItems: items.length,
    totalPages: items.length === 0 ? 0 : 1,
    hasNext: false,
    hasPrevious: false
  }
): PagedResponse<ProjectReportRow> {
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

function getLatestFetchSearchParam(
  fetchMock: ReturnType<typeof vi.fn>,
  parameter: string
) {
  const latestCall = fetchMock.mock.calls.at(-1);
  if (!latestCall) {
    return null;
  }

  return new URL(String(latestCall[0]), "http://localhost").searchParams.get(
    parameter
  );
}

function getFetchSearchParamForPath(
  fetchMock: ReturnType<typeof vi.fn>,
  pathPrefix: string,
  callIndex: number,
  parameter: string
) {
  const matchingPath = fetchMock.mock.calls
    .map(([input]) => String(input))
    .filter((path) => path.startsWith(pathPrefix))[callIndex];
  return new URL(matchingPath, "http://localhost").searchParams.get(parameter);
}

function countFetchesForPath(
  fetchMock: ReturnType<typeof vi.fn>,
  pathPrefix: string
) {
  return fetchMock.mock.calls
    .map(([input]) => String(input))
    .filter((path) => path.startsWith(pathPrefix)).length;
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
