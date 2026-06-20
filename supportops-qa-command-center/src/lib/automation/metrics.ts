type TicketMetricInput = { status: string };
type ReviewMetricInput = { action: string };
type AnalysisMetricInput = { confidence: number };

interface MetricsInput {
  tickets: TicketMetricInput[];
  reviews: ReviewMetricInput[];
  analyses: AnalysisMetricInput[];
}

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function calculateOverviewMetrics(input: MetricsInput) {
  const totalTickets = input.tickets.length;
  const autoResolved = input.tickets.filter((ticket) => ticket.status === "auto_resolved").length;
  const humanReview = input.tickets.filter((ticket) => ticket.status === "human_review").length;
  const escalated = input.tickets.filter((ticket) => ticket.status === "escalated").length;
  const approved = input.reviews.filter(
    (review) => review.action === "approve" || review.action === "edit_approve",
  ).length;
  const corrected = input.reviews.filter((review) => review.action === "edit_approve").length;
  const rejected = input.reviews.filter((review) => review.action === "reject").length;
  const escalationOverrides = input.reviews.filter((review) => review.action === "escalate").length;
  const confidenceTotal = input.analyses.reduce((sum, analysis) => sum + analysis.confidence, 0);

  return {
    totalTickets,
    autoResolutionRate: percent(autoResolved, totalTickets),
    humanReviewRate: percent(humanReview, totalTickets),
    escalationRate: percent(escalated, totalTickets),
    humanApprovalRate: percent(approved, input.reviews.length),
    correctionRate: percent(corrected, input.reviews.length),
    rejectionRate: percent(rejected, input.reviews.length),
    escalationOverrideRate: percent(escalationOverrides, input.reviews.length),
    averageConfidence:
      input.analyses.length === 0 ? 0 : Math.round((confidenceTotal / input.analyses.length) * 100),
  };
}
