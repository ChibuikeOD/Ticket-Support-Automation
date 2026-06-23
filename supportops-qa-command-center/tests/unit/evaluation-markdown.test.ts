import { describe, expect, it } from "vitest";
import {
  buildLatestGoldReportMarkdown,
  summarizeFailureThemes,
} from "@/lib/evaluation/markdown";
import type { EvaluationCaseResult } from "@/lib/evaluation/report-store";

const sampleCase: EvaluationCaseResult = {
  caseId: "GOLD-1",
  passed: false,
  pointsEarned: 1,
  pointsPossible: 3,
  failures: ["customer intent", "final action"],
  matches: { category: true, customerIntent: false, finalAction: false },
  ticket: {
    description: "Login fails",
    product: "Portal",
    priority: "High",
    channel: "Email",
  },
  expected: {
    category: "Account Access",
    customerIntent: "Log in",
    finalAction: "escalate",
  },
  actual: {
    category: "Account Access",
    customerIntent: "Reset password",
    finalAction: "human_review",
    confidence: 0.9,
    guardrailReasons: [],
  },
};

describe("evaluation markdown helpers", () => {
  it("summarizes repeated failure themes", () => {
    expect(
      summarizeFailureThemes([
        sampleCase,
        { ...sampleCase, caseId: "GOLD-2", failures: ["customer intent"] },
      ]),
    ).toEqual([
      { theme: "customer intent", count: 2 },
      { theme: "final action", count: 1 },
    ]);
  });

  it("builds markdown from a persisted latest gold report", () => {
    const markdown = buildLatestGoldReportMarkdown({
      runId: "run-1",
      generatedAt: "2026-06-23T12:00:00.000Z",
      model: "deepseek-chat",
      promptVersion: "ui",
      datasetPath: "gold.csv",
      batchSize: 1,
      source: "ui",
      summary: {
        totalCases: 1,
        totalPoints: 3,
        matchedPoints: 1,
        scorePercent: 33,
        categoryPoints: 1,
        intentPoints: 0,
        actionPoints: 0,
        passedCases: 0,
        categoryAccuracy: 100,
        customerIntentAccuracy: 0,
        finalActionAccuracy: 0,
      },
      cases: [sampleCase],
    });

    expect(markdown).toContain("# Gold Evaluation Report");
    expect(markdown).toContain("Score: 1/3 (33%)");
    expect(markdown).toContain("GOLD-1: customer intent, final action");
  });
});
