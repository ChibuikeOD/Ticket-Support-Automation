import Link from "next/link";
import type { GoldEvalRunSummary } from "@/lib/evaluation/report-store";

function formatGeneratedAt(value: string) {
  return new Date(value).toLocaleString();
}

export function GoldEvalRunHistory({
  runs,
  activeRunId,
}: {
  runs: GoldEvalRunSummary[];
  activeRunId?: string;
}) {
  if (runs.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-high/55 p-4 text-sm text-on-surface-variant">
        No archived runs yet. Completed evaluations will appear here.
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left">
          <thead className="bg-surface-container-high/50">
            <tr>
              <th className="echo-label px-6 py-5 text-outline">Generated</th>
              <th className="echo-label px-6 py-5 text-outline">Model</th>
              <th className="echo-label px-6 py-5 text-outline">Batch</th>
              <th className="echo-label px-6 py-5 text-outline">Score</th>
              <th className="echo-label px-6 py-5 text-outline">Perfect</th>
              <th className="echo-label px-6 py-5 text-outline">Source</th>
              <th className="echo-label px-6 py-5 text-right text-outline">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {runs.map((run) => {
              const isActive = run.runId === activeRunId;

              return (
                <tr
                  key={run.runId}
                  className={`transition-colors hover:bg-surface-container ${
                    isActive ? "bg-secondary-container/10" : ""
                  }`}
                >
                  <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">
                    {formatGeneratedAt(run.generatedAt)}
                  </td>
                  <td className="px-6 py-5 font-semibold text-foreground">{run.model}</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {run.batchSize ?? run.totalCases}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm font-bold text-primary">
                      {run.matchedPoints}/{run.totalPoints} ({run.scorePercent}%)
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {run.passedCases}/{run.totalCases}
                  </td>
                  <td className="px-6 py-5">
                    <span className="echo-label rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                      {run.source === "ui" ? "Evaluation" : "CLI"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3 text-sm font-semibold">
                      <Link href={`/reports/${run.runId}`} className="text-primary hover:underline">
                        View
                      </Link>
                      <a
                        href={`/api/reports/gold-eval/${run.runId}/markdown`}
                        className="text-on-surface-variant hover:text-primary"
                      >
                        Export
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
