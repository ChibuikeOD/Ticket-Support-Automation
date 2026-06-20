import { describe, expect, it } from "vitest";
import { parseAiAnalysis } from "@/lib/llm/schema";

describe("parseAiAnalysis", () => {
  it("accepts valid structured AI analysis", () => {
    const result = parseAiAnalysis({
      issueCategory: "Shipping",
      customerIntent: "Check delivery status",
      summary: "Customer asks for a delayed package update.",
      sentiment: "neutral",
      riskLevel: "low",
      draftResponse: "Thanks for reaching out. I can help check the delivery status.",
      confidence: 0.91,
      recommendedAction: "auto_resolve",
      escalationReason: "",
      policyChecks: [
        {
          policy: "Shipping status can be automated",
          status: "pass",
          reason: "No refund or address change requested.",
        },
      ],
    });

    expect(result.confidence).toBe(0.91);
    expect(result.recommendedAction).toBe("auto_resolve");
  });

  it("rejects invalid confidence values", () => {
    expect(() =>
      parseAiAnalysis({
        issueCategory: "Shipping",
        customerIntent: "Check delivery status",
        summary: "Customer asks for a delayed package update.",
        sentiment: "neutral",
        riskLevel: "low",
        draftResponse: "Thanks for reaching out.",
        confidence: 1.5,
        recommendedAction: "auto_resolve",
        escalationReason: "",
        policyChecks: [],
      }),
    ).toThrow("Invalid AI analysis");
  });

  it("rejects extra unknown top-level AI analysis keys", () => {
    expect(() =>
      parseAiAnalysis({
        issueCategory: "Shipping",
        customerIntent: "Check delivery status",
        summary: "Customer asks for a delayed package update.",
        sentiment: "neutral",
        riskLevel: "low",
        draftResponse: "Thanks for reaching out.",
        confidence: 0.85,
        recommendedAction: "auto_resolve",
        escalationReason: "",
        policyChecks: [],
        unexpectedKey: "should not be accepted",
      }),
    ).toThrow("Invalid AI analysis");
  });

  it("rejects extra unknown nested policy check keys", () => {
    expect(() =>
      parseAiAnalysis({
        issueCategory: "Shipping",
        customerIntent: "Check delivery status",
        summary: "Customer asks for a delayed package update.",
        sentiment: "neutral",
        riskLevel: "low",
        draftResponse: "Thanks for reaching out.",
        confidence: 0.85,
        recommendedAction: "auto_resolve",
        escalationReason: "",
        policyChecks: [
          {
            policy: "Shipping status can be automated",
            status: "pass",
            reason: "No refund or address change requested.",
            unexpectedKey: "should not be accepted",
          },
        ],
      }),
    ).toThrow("Invalid AI analysis");
  });

  it("identifies confidence in invalid confidence error messages", () => {
    expect(() =>
      parseAiAnalysis({
        issueCategory: "Shipping",
        customerIntent: "Check delivery status",
        summary: "Customer asks for a delayed package update.",
        sentiment: "neutral",
        riskLevel: "low",
        draftResponse: "Thanks for reaching out.",
        confidence: 1.5,
        recommendedAction: "auto_resolve",
        escalationReason: "",
        policyChecks: [],
      }),
    ).toThrow(/Invalid AI analysis: confidence:/);
  });
});
