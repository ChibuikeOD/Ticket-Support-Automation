import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

export type CsvTicket = Record<string, string | undefined>;

type TicketData = {
  customerName: string | null;
  customerEmail: string | null;
  productPurchased: string | null;
  ticketType: string | null;
  ticketSubject: string | null;
  ticketDescription: string;
  ticketStatus: string | null;
  resolution: string | null;
  priority: string | null;
  channel: string | null;
  firstResponseTime: string | null;
  timeToResolution: string | null;
  customerSatisfaction: string | null;
  status: string;
};

export type DatasetTicket = {
  externalId: string;
  data: TicketData;
};

function value(row: CsvTicket, key: string): string | null {
  const raw = row[key]?.trim();
  return raw && raw.length > 0 ? raw : null;
}

export function datasetCsvPath(cwd = process.cwd()) {
  const fullPath = path.join(cwd, "data/kaggle/customer_support_tickets.csv");
  const samplePath = path.join(cwd, "data/kaggle/customer_support_tickets.sample.csv");

  return {
    csvPath: fs.existsSync(fullPath) ? fullPath : samplePath,
    isFullDataset: fs.existsSync(fullPath),
  };
}

export function mapDatasetTicketRow(row: CsvTicket, rowNumber: number): DatasetTicket {
  const externalId = value(row, "Ticket ID");

  if (!externalId) {
    throw new Error(`Missing Ticket ID in CSV row ${rowNumber}.`);
  }

  const ticketDescription =
    value(row, "Ticket Description") ?? value(row, "Ticket Subject") ?? "No ticket description provided.";

  return {
    externalId,
    data: {
      customerName: value(row, "Customer Name"),
      customerEmail: value(row, "Customer Email"),
      productPurchased: value(row, "Product Purchased"),
      ticketType: value(row, "Ticket Type"),
      ticketSubject: value(row, "Ticket Subject"),
      ticketDescription,
      ticketStatus: value(row, "Ticket Status"),
      resolution: value(row, "Resolution"),
      priority: value(row, "Ticket Priority"),
      channel: value(row, "Ticket Channel"),
      firstResponseTime: value(row, "First Response Time"),
      timeToResolution: value(row, "Time to Resolution"),
      customerSatisfaction: value(row, "Customer Satisfaction Rating"),
      status: "seeded",
    },
  };
}

export function readDatasetTickets(cwd = process.cwd()) {
  const { csvPath, isFullDataset } = datasetCsvPath(cwd);
  const csv = fs.readFileSync(csvPath, "utf8");
  const parsed = Papa.parse<CsvTicket>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse failed: ${parsed.errors[0].message}`);
  }

  return {
    csvPath,
    isFullDataset,
    tickets: parsed.data.map((row, index) => mapDatasetTicketRow(row, index + 2)),
  };
}

export function selectRandomUnimportedTicket(
  tickets: DatasetTicket[],
  importedExternalIds: Set<string>,
  random = Math.random,
) {
  const candidates = tickets.filter((ticket) => !importedExternalIds.has(ticket.externalId));

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(random() * candidates.length)];
}
