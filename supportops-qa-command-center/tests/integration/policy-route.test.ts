import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/policies/route";

describe("POST /api/policies", () => {
  it("requires policy fields", async () => {
    const response = await POST(
      new Request("http://localhost/api/policies", {
        method: "POST",
        body: JSON.stringify({ name: "Missing text" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "name, category, ruleText, and severity are required.",
    });
  });
});
