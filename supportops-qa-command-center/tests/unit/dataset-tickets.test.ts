import { describe, expect, it } from "vitest";
import {
  datasetCsvPath,
  mapDatasetTicketRow,
  selectRandomOpenTicket,
} from "@/lib/dataset/tickets";

describe("dataset ticket helpers", () => {
  it("defaults to the external 200k customer support dataset", () => {
    expect(datasetCsvPath("C:\\repo\\supportops-qa-command-center")).toBe(
      "C:\\repo\\Datasets\\customer_support_tickets_200k.csv",
    );
  });

  it("maps customer support CSV rows into ticket data", () => {
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

  it("selects one open ticket for a sample run", () => {
    const selected = selectRandomOpenTicket(
      [
        { externalId: "1001", data: { status: "seeded", ticketStatus: "Closed" } },
        { externalId: "1002", data: { status: "seeded", ticketStatus: "Open" } },
        { externalId: "1003", data: { status: "seeded", ticketStatus: "Pending Customer" } },
      ],
      () => 0,
    );

    expect(selected?.externalId).toBe("1002");
  });

  it("returns null when no open sample tickets exist", () => {
    const selected = selectRandomOpenTicket(
      [{ externalId: "1001", data: { status: "seeded", ticketStatus: "Closed" } }],
      () => 0,
    );

    expect(selected).toBeNull();
  });
});
