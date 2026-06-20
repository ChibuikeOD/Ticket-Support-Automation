import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/automation/run/route";

describe("POST /api/automation/run", () => {
  it("rejects requests without selected tickets", async () => {
    const response = await POST(
      new Request("http://localhost/api/automation/run", {
        method: "POST",
        body: JSON.stringify({ ticketIds: [] }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ error: "Select at least one ticket." });
    expect(response.status).toBe(400);
  });
});
