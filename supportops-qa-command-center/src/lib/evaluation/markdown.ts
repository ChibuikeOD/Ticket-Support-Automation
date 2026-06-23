import type { EvaluationCaseResult, LatestGoldReport } from "@/lib/evaluation/report-store";

export interface FailureTheme {
  theme: string;
  count: number;
}

export function summarizeFailureThemes(cases: EvaluationCaseResult[]): FailureTheme[] {
  const counts = new Map<string, number>();

  for (const entry of cases) {
    for (const failure of entry.failures) {
      counts.set(failure, (counts.get(failure) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .sort((left, right) => right.count - left.count);
}

export function buildLatestGoldReportMarkdown(report: LatestGoldReport): string {
  const { summary } = report;
  const failingCases = report.cases.filter((entry) => !entry.passed).slice(0, 10);

  return [
    "# Gold Evaluation Report",
    "",
    "## Run Metadata",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Model: ${report.model}`,
    `- Prompt version: ${report.promptVersion}`,
    `- Dataset: ${report.datasetPath}`,
    ...(report.batchSize ? [`- Batch size: ${report.batchSize}`] : []),
    ...(report.source ? [`- Source: ${report.source}`] : []),
    "",
    "## Summary",
    "",
    `- Total cases: ${summary.totalCases}`,
    `- Score: ${summary.matchedPoints}/${summary.totalPoints} (${summary.scorePercent}%)`,
    `- Perfect cases (3/3 each): ${summary.passedCases}/${summary.totalCases}`,
    `- Category points: ${summary.categoryPoints}/${summary.totalCases} (${summary.categoryAccuracy}%)`,
    `- Intent points: ${summary.intentPoints}/${summary.totalCases} (${summary.customerIntentAccuracy}%)`,
    `- Action points: ${summary.actionPoints}/${summary.totalCases} (${summary.finalActionAccuracy}%)`,
    "",
    "## Failure Examples",
    "",
    ...(failingCases.length === 0
      ? ["- No failures found."]
      : failingCases.flatMap((entry) => [
          `- ${entry.caseId}: ${entry.failures.join(", ")}`,
          `  - Ticket: ${entry.ticket.description}`,
          `  - Expected: ${entry.expected.finalAction}, ${entry.expected.category}, ${entry.expected.customerIntent}`,
          `  - Actual: ${entry.actual.finalAction}, ${entry.actual.category}, ${entry.actual.customerIntent}`,
        ])),
    "",
  ].join("\n");
}
