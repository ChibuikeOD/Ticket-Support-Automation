import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";

describe("shared UI components", () => {
  it("renders the app shell navigation and content", () => {
    render(
      <AppShell>
        <h1>Dashboard content</h1>
      </AppShell>,
    );

    expect(screen.getByText("SupportOps QA")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/");
    expect(screen.queryByRole("link", { name: "Backlog" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Dashboard content" })).toBeTruthy();
  });

  it("renders metric card values", () => {
    render(<MetricCard label="Auto-resolution rate" value="42%" helper="Batch average" />);

    expect(screen.getByText("Auto-resolution rate")).toBeTruthy();
    expect(screen.getByText("42%")).toBeTruthy();
    expect(screen.getByText("Batch average")).toBeTruthy();
  });

  it("formats status badges", () => {
    render(<StatusBadge status="human_review" />);

    expect(screen.getByText("human review")).toBeTruthy();
  });
});
