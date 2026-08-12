import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders the users report route through the router", () => {
    render(
      <MemoryRouter initialEntries={["/reports/users"]}>
        <AppShell />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Users report" })
    ).toBeInTheDocument();
    expect(screen.getByText("/api/reports/users")).toBeInTheDocument();
  });
});

