interface ReportMetrics {
  totalTickets: number;
  autoResolutionRate: number;
  humanReviewRate: number;
  escalationRate: number;
  humanApprovalRate: number;
  correctionRate: number;
  rejectionRate: number;
  escalationOverrideRate: number;
  averageConfidence: number;
}

interface MarkdownReportInput {
  runName: string;
  model: string;
  promptVersion: string;
  metrics: ReportMetrics;
  examples: string[];
}

export function buildMarkdownReport(input: MarkdownReportInput): string {
  return [
    `# QA Report: ${input.runName}`,
    "",
    "## Run Metadata",
    "",
    `- Model: ${input.model}`,
    `- Prompt version: ${input.promptVersion}`,
    "",
    "## Metrics",
    "",
    `- Total tickets: ${input.metrics.totalTickets}`,
    `- Auto-resolution rate: ${input.metrics.autoResolutionRate}%`,
    `- Human-review rate: ${input.metrics.humanReviewRate}%`,
    `- Escalation rate: ${input.metrics.escalationRate}%`,
    `- Human approval rate: ${input.metrics.humanApprovalRate}%`,
    `- Correction rate: ${input.metrics.correctionRate}%`,
    `- Rejection rate: ${input.metrics.rejectionRate}%`,
    `- Escalation override rate: ${input.metrics.escalationOverrideRate}%`,
    `- Average confidence: ${input.metrics.averageConfidence}%`,
    "",
    "## Representative Examples",
    "",
    ...input.examples.map((example) => `- ${example}`),
    "",
    "## Recommendations",
    "",
    "- Review categories with high escalation or correction rates.",
    "- Tighten policies for repeated failure modes.",
    "- Compare prompt versions before raising the auto-resolution threshold.",
  ].join("\n");
}
