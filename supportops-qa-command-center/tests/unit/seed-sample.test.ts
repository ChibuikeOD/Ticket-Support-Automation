import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { datasetCsvPath, readDatasetTickets, selectRandomOpenTicket } from "@/lib/dataset/tickets";

describe("sample support ticket data", () => {
  it("uses the external 200k dataset with open tickets", () => {
    const samplePath = datasetCsvPath();

    expect(fs.existsSync(samplePath)).toBe(true);

    const dataset = readDatasetTickets();
    const openTicket = selectRandomOpenTicket(dataset.tickets, () => 0);

    expect(dataset.tickets.length).toBeGreaterThan(0);
    expect(openTicket?.data.ticketStatus).toBe("Open");
    expect(openTicket?.externalId).toBeTruthy();
    expect(openTicket?.data.ticketDescription).toBeTruthy();
  }, 20000);
});
