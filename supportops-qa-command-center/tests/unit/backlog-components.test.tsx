import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunBatchButton } from "@/components/run-batch-button";
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

  it("disables batch runs when no tickets are selected", () => {
    render(<RunBatchButton ticketIds={[]} />);

    const button = screen.getByRole("button", { name: "Run batch (0)" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("shows the selected batch count", () => {
    render(<RunBatchButton ticketIds={["ticket-1", "ticket-2"]} />);

    const button = screen.getByRole("button", { name: "Run batch (2)" }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
