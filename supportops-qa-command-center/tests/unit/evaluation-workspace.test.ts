import { describe, expect, it } from "vitest";
import { selectGoldCasesByPercentage } from "@/lib/evaluation/workspace";

describe("evaluation workspace helpers", () => {
  it("selects the requested percentage of gold cases using ceiling rounding", () => {
    const cases = Array.from({ length: 100 }, (_, index) => ({
      id: `GOLD-${index + 1}`,
    }));

    expect(selectGoldCasesByPercentage(cases, 25)).toHaveLength(25);
    expect(selectGoldCasesByPercentage(cases, 50)).toHaveLength(50);
    expect(selectGoldCasesByPercentage(cases, 75)).toHaveLength(75);
    expect(selectGoldCasesByPercentage(cases, 100)).toHaveLength(100);
  });

  it("rejects unsupported percentages", () => {
    expect(() => selectGoldCasesByPercentage([{ id: "GOLD-1" }], 10)).toThrow(
      "Evaluation percentage must be one of 25, 50, 75, or 100.",
    );
  });
});
