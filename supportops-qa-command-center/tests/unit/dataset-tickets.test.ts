import { describe, expect, it } from "vitest";
import { mapDatasetTicketRow, selectRandomUnimportedTicket } from "@/lib/dataset/tickets";

describe("dataset ticket helpers", () => {
  it("maps Kaggle CSV rows into ticket create data", () => {
    const ticket = mapDatasetTicketRow(
      {
        "Ticket ID": "1001",
        "Customer Name": "Avery Stone",
        "Customer Email": "avery@example.com",
        "Product Purchased": "Pro Plan",
        "Ticket Type": "Billing",
        "Ticket Subject": "Charged after cancellation",
        "Ticket Description": "I canceled but was charged again.",
        "Ticket Status": "Open",
        Resolution: "",
        "Ticket Priority": "High",
        "Ticket Channel": "Email",
        "First Response Time": "",
        "Time to Resolution": "",
        "Customer Satisfaction Rating": "2",
      },
      2,
    );

    expect(ticket.externalId).toBe("1001");
    expect(ticket.data.ticketSubject).toBe("Charged after cancellation");
    expect(ticket.data.resolution).toBeNull();
    expect(ticket.data.status).toBe("seeded");
  });

  it("selects only tickets that have not already been imported", () => {
    const selected = selectRandomUnimportedTicket(
      [
        { externalId: "1001", data: { status: "seeded" } },
        { externalId: "1002", data: { status: "seeded" } },
      ],
      new Set(["1001"]),
      () => 0,
    );

    expect(selected?.externalId).toBe("1002");
  });

  it("returns null when every dataset ticket is already imported", () => {
    const selected = selectRandomUnimportedTicket(
      [{ externalId: "1001", data: { status: "seeded" } }],
      new Set(["1001"]),
      () => 0,
    );

    expect(selected).toBeNull();
  });
});
