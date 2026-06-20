import { describe, expect, it } from "vitest";
import { calculateOverviewMetrics } from "@/lib/automation/metrics";

describe("calculateOverviewMetrics", () => {
  it("calculates routing and review rates", () => {
    const metrics = calculateOverviewMetrics({
      tickets: [
        { status: "auto_resolved" },
        { status: "human_review" },
        { status: "escalated" },
        { status: "review_approved" },
      ],
      reviews: [
        { action: "approve" },
        { action: "edit_approve" },
        { action: "reject" },
        { action: "escalate" },
      ],
      analyses: [{ confidence: 0.9 }, { confidence: 0.7 }],
    });

    expect(metrics.totalTickets).toBe(4);
    expect(metrics.autoResolutionRate).toBe(25);
    expect(metrics.humanReviewRate).toBe(25);
    expect(metrics.escalationRate).toBe(25);
    expect(metrics.humanApprovalRate).toBe(50);
    expect(metrics.correctionRate).toBe(25);
    expect(metrics.averageConfidence).toBe(80);
  });
});
