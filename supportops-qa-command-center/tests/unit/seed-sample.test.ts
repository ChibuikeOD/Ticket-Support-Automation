import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";

type CsvTicket = Record<string, string | undefined>;

describe("sample support ticket seed data", () => {
  it("contains five seedable tickets with required fields", () => {
    const samplePath = path.join(
      process.cwd(),
      "data/kaggle/customer_support_tickets.sample.csv",
    );

    expect(fs.existsSync(samplePath)).toBe(true);

    const csv = fs.readFileSync(samplePath, "utf8");
    const parsed = Papa.parse<CsvTicket>(csv, {
      header: true,
      skipEmptyLines: true,
    });

    expect(parsed.errors).toEqual([]);
    expect(parsed.data).toHaveLength(5);

    for (const record of parsed.data) {
      expect(record["Ticket ID"]?.trim()).toBeTruthy();
      expect(record["Ticket Description"]?.trim()).toBeTruthy();
    }
  });
});
