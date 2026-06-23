import fs from "node:fs";
import { readFile } from "node:fs/promises";
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

function firstValue(row: CsvTicket, keys: string[]): string | null {
  for (const key of keys) {
    const found = value(row, key);
    if (found) return found;
  }

  return null;
}

export function datasetCsvPath(cwd = process.cwd()) {
  return process.env.SAMPLE_DATASET_PATH
    ? path.resolve(cwd, process.env.SAMPLE_DATASET_PATH)
    : path.resolve(cwd, "..", "Datasets", "customer_support_tickets_200k.csv");
}

function sampleDatasetUrl() {
  return (
    process.env.SAMPLE_DATASET_URL ??
    "https://raw.githubusercontent.com/ChibuikeOD/Ticket-Support-Automation/main/Datasets/customer_support_tickets_200k.csv"
  );
}

export function mapDatasetTicketRow(row: CsvTicket, rowNumber: number): DatasetTicket {
  const externalId = firstValue(row, ["ticket_id", "Ticket ID"]);

  if (!externalId) {
    throw new Error(`Missing Ticket ID in CSV row ${rowNumber}.`);
  }

  const ticketDescription =
    firstValue(row, ["issue_description", "Ticket Description", "Ticket Subject"]) ??
    "No ticket description provided.";

  return {
    externalId,
    data: {
      customerName: firstValue(row, ["customer_name", "Customer Name"]),
      customerEmail: firstValue(row, ["customer_email", "Customer Email"]),
      productPurchased: firstValue(row, ["product", "Product Purchased"]),
      ticketType: firstValue(row, ["category", "Ticket Type"]),
      ticketSubject: firstValue(row, ["category", "Ticket Subject"]),
      ticketDescription,
      ticketStatus: firstValue(row, ["status", "Ticket Status"]),
      resolution: firstValue(row, ["resolution_notes", "Resolution"]),
      priority: firstValue(row, ["priority", "Ticket Priority"]),
      channel: firstValue(row, ["channel", "Ticket Channel"]),
      firstResponseTime: firstValue(row, ["first_response_time_hours", "First Response Time"]),
      timeToResolution: firstValue(row, ["resolution_time_hours", "Time to Resolution"]),
      customerSatisfaction: firstValue(row, ["customer_satisfaction_score", "Customer Satisfaction Rating"]),
      status: "seeded",
    },
  };
}

export function readDatasetTickets(cwd = process.cwd()) {
  const csvPath = datasetCsvPath(cwd);
  const csv = fs.readFileSync(csvPath, "utf8");

  return parseDatasetTickets(csv, csvPath);
}

export async function readDatasetTicketsAsync(cwd = process.cwd()) {
  const csvPath = datasetCsvPath(cwd);

  try {
    return parseDatasetTickets(await readFile(csvPath, "utf8"), csvPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const url = sampleDatasetUrl();
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Sample dataset request failed with status ${response.status}`);
  }

  return parseDatasetTickets(await response.text(), url);
}

function parseDatasetTickets(csv: string, csvPath: string) {
  const parsed = Papa.parse<CsvTicket>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse failed: ${parsed.errors[0].message}`);
  }

  return {
    csvPath,
    tickets: parsed.data.map((row, index) => mapDatasetTicketRow(row, index + 2)),
  };
}

export function selectRandomOpenTicket(tickets: DatasetTicket[], random = Math.random) {
  const candidates = tickets.filter((ticket) => ticket.data.ticketStatus?.toLowerCase() === "open");

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(random() * candidates.length)];
}
