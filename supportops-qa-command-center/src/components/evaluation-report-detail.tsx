import Link from "next/link";
import { EvaluationCaseResults } from "@/components/evaluation-case-results";
import { EvaluationDimensionBars } from "@/components/evaluation-dimension-bars";
import { EvaluationSummaryGrid } from "@/components/evaluation-summary-grid";
import { summarizeFailureThemes } from "@/lib/evaluation/markdown";
import type { LatestGoldReport } from "@/lib/evaluation/report-store";

function formatGeneratedAt(value: string) {
  return new Date(value).toLocaleString();
}

export function EvaluationReportDetail({
  report,
  exportHref,
}: {
  report: LatestGoldReport;
  exportHref: string;
}) {
  const failureThemes = summarizeFailureThemes(report.cases);
  const generatedAt = formatGeneratedAt(report.generatedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Run Summary</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {report.model} · {report.batchSize ?? report.summary.totalCases} cases · {generatedAt}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="echo-label rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
            {report.source === "ui" ? "Evaluation tab" : "CLI"}
          </span>
          <a href={exportHref} className="echo-ghost-button rounded-xl px-4 py-2 text-sm font-bold">
            Export Markdown
          </a>
        </div>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
          Model: <span className="font-semibold text-primary">{report.model}</span>
        </div>
        <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
          Prompt: <span className="font-semibold text-primary">{report.promptVersion}</span>
        </div>
        <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
          Batch size:{" "}
          <span className="font-semibold text-primary">
            {report.batchSize ?? report.summary.totalCases}
          </span>
        </div>
        <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
          Generated: <span className="font-semibold text-primary">{generatedAt}</span>
        </div>
      </div>

      <EvaluationSummaryGrid summary={report.summary} />
      <EvaluationDimensionBars summary={report.summary} />

      {failureThemes.length > 0 ? (
        <section className="glass-panel rounded-2xl p-6">
          <h3 className="text-xl font-bold text-foreground">Top Failure Themes</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Most common mismatches across cases in this run.
          </p>
          <div className="mt-4 space-y-3">
            {failureThemes.map(({ theme, count }) => (
              <div
                key={theme}
                className="flex items-center justify-between rounded-xl bg-surface-container-high/55 px-4 py-3"
              >
                <span className="text-sm text-foreground">{theme}</span>
                <span className="echo-label rounded-full border border-error/30 bg-error/10 px-3 py-1 text-error">
                  {count} case{count === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">Case Breakdown</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Expand a case to compare gold labels against model output.
            </p>
          </div>
          <Link href="/evaluation" className="text-sm font-semibold text-primary hover:underline">
            Run another batch
          </Link>
        </div>
        <div className="mt-5">
          <EvaluationCaseResults cases={report.cases} />
        </div>
      </section>
    </div>
  );
}
