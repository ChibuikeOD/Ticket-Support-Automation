import { describe, expect, it } from "vitest";
import { defaultPolicyTexts } from "@/lib/policies/defaults";

describe("default policy texts", () => {
  it("provides sample-run policies without requiring a database", () => {
    expect(defaultPolicyTexts()).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Financial-sensitive tickets"),
        expect.stringContaining("Authentication"),
        expect.stringContaining("Technical troubleshooting"),
      ]),
    );
  });
});
