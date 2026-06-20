export type TicketStatus =
  | "seeded"
  | "processing"
  | "auto_resolved"
  | "human_review"
  | "escalated"
  | "review_approved"
  | "review_edited"
  | "review_rejected";

export type RiskLevel = "low" | "medium" | "high";
export type Sentiment = "positive" | "neutral" | "frustrated" | "angry";
export type RecommendedAction = "auto_resolve" | "human_review" | "escalate";
export type PolicyCheckStatus = "pass" | "needs_review" | "fail";
export type ReviewAction = "approve" | "edit_approve" | "reject" | "escalate";

export interface PolicyCheck {
  policy: string;
  status: PolicyCheckStatus;
  reason: string;
}

export interface AiAnalysisResult {
  issueCategory: string;
  customerIntent: string;
  summary: string;
  sentiment: Sentiment;
  riskLevel: RiskLevel;
  draftResponse: string;
  confidence: number;
  recommendedAction: RecommendedAction;
  escalationReason: string;
  policyChecks: PolicyCheck[];
}

export interface GuardrailDecision {
  finalAction: RecommendedAction;
  reasons: string[];
}
