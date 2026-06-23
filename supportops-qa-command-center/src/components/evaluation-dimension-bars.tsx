import type { GoldEvaluationSummary } from "@/lib/evaluation/gold";

const dimensions: Array<{
  label: string;
  accuracyKey: keyof GoldEvaluationSummary;
  pointsKey: keyof GoldEvaluationSummary;
}> = [
  { label: "Category", accuracyKey: "categoryAccuracy", pointsKey: "categoryPoints" },
  { label: "Intent", accuracyKey: "customerIntentAccuracy", pointsKey: "intentPoints" },
  { label: "Action", accuracyKey: "finalActionAccuracy", pointsKey: "actionPoints" },
];

export function EvaluationDimensionBars({ summary }: { summary: GoldEvaluationSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {dimensions.map(({ label, accuracyKey, pointsKey }) => {
        const accuracy = summary[accuracyKey] as number;
        const points = summary[pointsKey] as number;

        return (
          <div key={label} className="rounded-xl bg-surface-container-high/55 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="echo-label text-outline">{label}</div>
              <span className="font-mono text-sm font-bold text-primary">{accuracy}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-on-surface-variant">
              {points}/{summary.totalCases} cases matched
            </div>
          </div>
        );
      })}
    </div>
  );
}
