import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CsvTicket = Record<string, string | undefined>;

function value(row: CsvTicket, key: string): string | null {
  const raw = row[key]?.trim();
  return raw && raw.length > 0 ? raw : null;
}

async function main() {
  const fullPath = path.join(process.cwd(), "data/kaggle/customer_support_tickets.csv");
  const samplePath = path.join(process.cwd(), "data/kaggle/customer_support_tickets.sample.csv");
  const csvPath = fs.existsSync(fullPath) ? fullPath : samplePath;
  const csv = fs.readFileSync(csvPath, "utf8");
  const parsed = Papa.parse<CsvTicket>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse failed: ${parsed.errors[0].message}`);
  }

  for (const [index, row] of parsed.data.entries()) {
    const rowNumber = index + 2;
    const externalId = value(row, "Ticket ID");

    if (!externalId) {
      throw new Error(`Missing Ticket ID in CSV row ${rowNumber}.`);
    }

    const ticketDescription =
      value(row, "Ticket Description") ??
      value(row, "Ticket Subject") ??
      "No ticket description provided.";
    const ticketData = {
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
    };

    await prisma.ticket.upsert({
      where: { externalId },
      update: ticketData,
      create: {
        externalId,
        ...ticketData,
      },
    });
  }

  const defaultPolicies = [
    {
      name: "Billing and refunds require review",
      category: "Billing",
      ruleText:
        "Tickets involving charges, refunds, cancellations, invoices, or payment disputes must not be auto-resolved.",
      severity: "high",
    },
    {
      name: "Account access requires review",
      category: "Account",
      ruleText:
        "Tickets involving login failures, password resets, suspicious access, or account ownership require human review.",
      severity: "high",
    },
    {
      name: "Shipping status can be automated",
      category: "Shipping",
      ruleText:
        "Simple shipping status questions can be auto-resolved when no refund, replacement, or address change is requested.",
      severity: "low",
    },
  ];

  for (const policy of defaultPolicies) {
    await prisma.policyRule.upsert({
      where: { name: policy.name },
      update: policy,
      create: policy,
    });
  }

  const count = await prisma.ticket.count();
  console.log(`Seeded ${count} tickets.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
