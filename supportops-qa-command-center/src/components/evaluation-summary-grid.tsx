import type { GoldEvaluationSummary } from "@/lib/evaluation/gold";

const summaryMetrics: Array<{
  key: keyof GoldEvaluationSummary;
  label: string;
  format: (summary: GoldEvaluationSummary) => string;
}> = [
  {
    key: "matchedPoints",
    label: "Score",
    format: (summary) => `${summary.matchedPoints}/${summary.totalPoints}`,
  },
  {
    key: "scorePercent",
    label: "Score %",
    format: (summary) => `${summary.scorePercent}%`,
  },
  {
    key: "passedCases",
    label: "Perfect cases",
    format: (summary) => `${summary.passedCases}/${summary.totalCases}`,
  },
  {
    key: "categoryPoints",
    label: "Category",
    format: (summary) => `${summary.categoryPoints}/${summary.totalCases}`,
  },
  {
    key: "intentPoints",
    label: "Intent",
    format: (summary) => `${summary.intentPoints}/${summary.totalCases}`,
  },
  {
    key: "actionPoints",
    label: "Action",
    format: (summary) => `${summary.actionPoints}/${summary.totalCases}`,
  },
];

export function EvaluationSummaryGrid({ summary }: { summary: GoldEvaluationSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {summaryMetrics.map(({ key, label, format }) => (
        <div key={key} className="rounded-xl bg-surface-container-high/55 p-4">
          <div className="echo-label text-outline">{label}</div>
          <div className="mt-2 text-3xl font-bold text-primary">{format(summary)}</div>
        </div>
      ))}
    </div>
  );
}
