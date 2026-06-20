import type { AiAnalysisResult } from "@/lib/types";

export const lowRiskAnalysis: AiAnalysisResult = {
  issueCategory: "Shipping",
  customerIntent: "Check order delivery status",
  summary: "Customer asks when a delayed package will arrive.",
  sentiment: "neutral",
  riskLevel: "low",
  draftResponse:
    "Thanks for reaching out. Your order appears delayed, and I can help check the latest delivery status.",
  confidence: 0.91,
  recommendedAction: "auto_resolve",
  escalationReason: "",
  policyChecks: [
    {
      policy: "Shipping status questions can be auto-resolved when no refund is requested.",
      status: "pass",
      reason: "The customer only asks for delivery status.",
    },
  ],
};

// Intentionally adversarial: guardrails should override the AI's auto-resolve recommendation.
export const billingAnalysis: AiAnalysisResult = {
  issueCategory: "Billing",
  customerIntent: "Request refund for subscription charge",
  summary: "Customer says they were charged after cancellation.",
  sentiment: "frustrated",
  riskLevel: "high",
  draftResponse:
    "I am sorry for the confusion. I can look into the charge and help route this to billing review.",
  confidence: 0.77,
  recommendedAction: "auto_resolve",
  escalationReason: "",
  policyChecks: [
    {
      policy: "Refunds and billing disputes require human review.",
      status: "needs_review",
      reason: "Refund eligibility requires account history.",
    },
  ],
};
