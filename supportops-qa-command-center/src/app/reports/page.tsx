import Link from "next/link";
import { EvaluationReportDetail } from "@/components/evaluation-report-detail";
import { GoldEvalRunHistory } from "@/components/gold-eval-run-history";
import {
  listGoldEvalRuns,
  loadLatestGoldReport,
} from "@/lib/evaluation/report-store";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [latestReport, runs] = await Promise.all([loadLatestGoldReport(), listGoldEvalRuns()]);
  const exportHref = latestReport?.runId
    ? `/api/reports/gold-eval/${latestReport.runId}/markdown`
    : "/api/reports/gold-eval/latest/markdown";

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-5xl">
            Evaluation Reports
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-on-surface-variant">
            Review gold evaluation runs, inspect failure patterns, and export markdown summaries for
            prompt and model comparisons.
          </p>
        </div>
        {latestReport ? (
          <a href={exportHref} className="echo-gradient-button rounded-xl px-5 py-3 text-sm font-bold">
            Export Latest Markdown
          </a>
        ) : null}
      </div>

      {latestReport ? (
        <section className="glass-panel rounded-3xl p-6">
          <EvaluationReportDetail report={latestReport} exportHref={exportHref} />
        </section>
      ) : (
        <section className="glass-panel rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-foreground">No evaluation runs yet</h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            Run a gold evaluation batch to generate your first report. Results will appear here with
            case-level breakdowns and exportable markdown.
          </p>
          <Link
            href="/evaluation"
            className="echo-gradient-button mt-5 inline-flex rounded-xl px-5 py-3 text-sm font-bold"
          >
            Run evaluation
          </Link>
        </section>
      )}

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Run History</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Every completed gold evaluation is archived here for comparison.
            </p>
          </div>
          <span className="echo-label rounded-full border border-outline-variant/40 px-3 py-1 text-outline">
            {runs.length} run{runs.length === 1 ? "" : "s"}
          </span>
        </div>
        <GoldEvalRunHistory runs={runs} activeRunId={latestReport?.runId} />
      </section>
    </div>
  );
}
