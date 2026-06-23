import { describe, expect, it } from "vitest";
import { selectRandomGoldCases } from "@/lib/evaluation/workspace";

describe("evaluation workspace helpers", () => {
  it("selects the requested number of random gold cases without replacement", () => {
    const cases = Array.from({ length: 100 }, (_, index) => ({
      id: `GOLD-${index + 1}`,
    }));

    const selected = selectRandomGoldCases(cases, 10, () => 0);

    expect(selected).toHaveLength(10);
    expect(new Set(selected.map((item) => item.id)).size).toBe(10);
    expect(selected.every((item) => cases.includes(item))).toBe(true);
  });

  it("samples different rows on subsequent calls", () => {
    const cases = Array.from({ length: 100 }, (_, index) => index);
    const first = selectRandomGoldCases(cases, 20).join(",");
    const second = selectRandomGoldCases(cases, 20).join(",");

    expect(first).not.toBe(second);
  });

  it("rejects unsupported batch sizes", () => {
    expect(() => selectRandomGoldCases([{ id: "GOLD-1" }], 25)).toThrow(
      "Evaluation batch size must be one of 5, 10, 15, or 20.",
    );
  });
});
