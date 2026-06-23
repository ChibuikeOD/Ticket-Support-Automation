import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SampleRunner } from "@/components/sample-runner";
import { TicketTable } from "@/components/ticket-table";

describe("backlog components", () => {
  it("renders ticket rows with ticket detail links", () => {
    render(
      <TicketTable
        tickets={[
          {
            id: "ticket-1",
            externalId: "1001",
            ticketSubject: "Shipping delay",
            ticketType: "Shipping",
            productPurchased: "Wireless Headphones",
            priority: "Medium",
            channel: "Email",
            status: "seeded",
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Shipping delay" }).getAttribute("href")).toBe("/tickets/ticket-1");
    expect(screen.getByText("Wireless Headphones")).toBeTruthy();
    expect(screen.getByText("seeded")).toBeTruthy();
  });

  it("renders a one-ticket sample runner", () => {
    render(<SampleRunner />);

    expect(screen.getByText("Sample Run")).toBeTruthy();
    const button = screen.getByRole("button", { name: "Run one open ticket" }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
