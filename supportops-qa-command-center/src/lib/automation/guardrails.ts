import type { AiAnalysisResult, GuardrailDecision, RecommendedAction } from "@/lib/types";

interface GuardrailOptions {
  confidenceThreshold: number;
}

const humanReviewCategories = [
  "billing",
  "refund",
  "refunds",
  "account",
  "privacy",
  "outage",
  "legal",
];

const escalationCategories = ["security", "legal", "safety", "severe impact"];

function categoryIncludes(category: string, terms: string[]): boolean {
  const normalized = category.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

export function applyGuardrails(
  analysis: AiAnalysisResult,
  options: GuardrailOptions,
): GuardrailDecision {
  const reasons: string[] = [];
  let finalAction: RecommendedAction = analysis.recommendedAction;

  if (categoryIncludes(analysis.issueCategory, escalationCategories)) {
    return {
      finalAction: "escalate",
      reasons: ["Security, legal, safety, and severe-impact issues require escalation."],
    };
  }

  if (analysis.confidence < options.confidenceThreshold) {
    finalAction = "human_review";
    reasons.push("Confidence is below the auto-resolution threshold.");
  }

  if (analysis.riskLevel !== "low") {
    finalAction = "human_review";
    reasons.push("Only low-risk tickets can be auto-resolved.");
  }

  if (analysis.sentiment === "angry" || analysis.sentiment === "frustrated") {
    finalAction = "human_review";
    reasons.push("Angry or frustrated customer sentiment requires human review.");
  }

  if (categoryIncludes(analysis.issueCategory, humanReviewCategories)) {
    finalAction = "human_review";
    reasons.push("Billing, refund, account, privacy, outage, and legal issues require human review.");
  }

  if (analysis.policyChecks.some((check) => check.status !== "pass")) {
    finalAction = "human_review";
    reasons.push("One or more policy checks require review.");
  }

  if (analysis.recommendedAction === "escalate") {
    finalAction = "escalate";
    reasons.push("The AI recommended escalation.");
  }

  if (finalAction === "auto_resolve" && reasons.length === 0) {
    reasons.push("AI recommendation is eligible for auto-resolution.");
  }

  return { finalAction, reasons };
}
