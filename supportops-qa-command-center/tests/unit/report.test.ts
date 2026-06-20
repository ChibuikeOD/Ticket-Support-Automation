import { describe, expect, it } from "vitest";
import { buildMarkdownReport } from "@/lib/automation/report";

describe("buildMarkdownReport", () => {
  it("includes run metadata and QA metrics", () => {
    const report = buildMarkdownReport({
      runName: "Run 1",
      model: "deepseek-chat",
      promptVersion: "v1",
      metrics: {
        totalTickets: 5,
        autoResolutionRate: 40,
        humanReviewRate: 40,
        escalationRate: 20,
        humanApprovalRate: 75,
        correctionRate: 25,
        rejectionRate: 0,
        escalationOverrideRate: 0,
        averageConfidence: 84,
      },
      examples: ["Ticket 1001 required billing review."],
    });

    expect(report).toContain("# QA Report: Run 1");
    expect(report).toContain("- Model: deepseek-chat");
    expect(report).toContain("- Auto-resolution rate: 40%");
    expect(report).toContain("Ticket 1001 required billing review.");
  });
});
