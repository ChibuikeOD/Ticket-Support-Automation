import { describe, expect, it } from "vitest";
import { applyGuardrails } from "@/lib/automation/guardrails";
import { billingAnalysis, lowRiskAnalysis } from "@/test/fixtures";

describe("applyGuardrails", () => {
  it("allows low-risk high-confidence shipping tickets to auto-resolve", () => {
    const decision = applyGuardrails(lowRiskAnalysis, { confidenceThreshold: 0.82 });

    expect(decision.finalAction).toBe("auto_resolve");
    expect(decision.reasons).toContain("AI recommendation is eligible for auto-resolution.");
  });

  it("routes billing tickets to human review even when AI recommends auto-resolve", () => {
    const decision = applyGuardrails(billingAnalysis, { confidenceThreshold: 0.82 });

    expect(decision.finalAction).toBe("human_review");
    expect(decision.reasons).toContain("Billing, refund, account, privacy, outage, and legal issues require human review.");
  });

  it("escalates severe security or legal categories", () => {
    const decision = applyGuardrails(
      {
        ...lowRiskAnalysis,
        issueCategory: "Security",
        riskLevel: "high",
        recommendedAction: "auto_resolve",
      },
      { confidenceThreshold: 0.82 },
    );

    expect(decision.finalAction).toBe("escalate");
    expect(decision.reasons).toContain("Security, legal, safety, and severe-impact issues require escalation.");
  });
});
