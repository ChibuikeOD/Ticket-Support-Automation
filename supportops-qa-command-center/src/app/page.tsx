import { MetricCard } from "@/components/metric-card";
import { SampleRunner } from "@/components/sample-runner";
import { loadGoldDashboardSummary } from "@/lib/evaluation/dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const gold = await loadGoldDashboardSummary();
  const latest = gold.latestReport;
  const generatedAt = latest ? new Date(latest.generatedAt).toLocaleString() : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-5xl">Gold Dataset Evaluation</h1>
        <p className="mt-3 max-w-2xl text-lg text-on-surface-variant">
          This dashboard shows model quality against the curated gold dataset, then lets you try one open sample
          ticket at a time.
        </p>
      </div>
      {!process.env.DEEPSEEK_API_KEY ? (
        <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          DeepSeek API key is not configured. Add DEEPSEEK_API_KEY to .env before running gold evaluations or
          sample tickets.
        </div>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Gold cases" value={String(gold.dataset.caseCount)} helper="Curated eval rows" />
        <MetricCard
          label="Evaluation score"
          value={latest ? `${latest.summary.matchedPoints}/${latest.summary.totalPoints}` : "No run"}
          helper="Category + intent + action points"
        />
        <MetricCard
          label="Perfect cases"
          value={latest ? `${latest.summary.passedCases}/${latest.summary.totalCases}` : "No run"}
          helper="Latest evaluation run"
        />
        <MetricCard
          label="Score %"
          value={latest ? `${latest.summary.scorePercent}%` : "No run"}
          helper="Latest evaluation run"
        />
      </div>
      <section className="glass-panel rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Latest Evaluation Run</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {latest
                ? `${latest.source === "ui" ? "Saved from the Evaluation tab" : "Saved from CLI gold eval"}${
                    latest.batchSize ? ` · ${latest.batchSize} cases` : ""
                  }`
                : gold.dataset.path}
            </p>
          </div>
          <span className="echo-label rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
            Gold Dataset
          </span>
        </div>
        {latest ? (
          <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Model: <span className="font-semibold text-primary">{latest.model}</span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Prompt: <span className="font-semibold text-primary">{latest.promptVersion}</span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Passed cases:{" "}
              <span className="font-semibold text-primary">
                {latest.summary.passedCases}/{latest.summary.totalCases}
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Generated: <span className="font-semibold text-primary">{generatedAt}</span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Score:{" "}
              <span className="font-semibold text-primary">
                {latest.summary.matchedPoints}/{latest.summary.totalPoints} ({latest.summary.scorePercent}%)
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Category points:{" "}
              <span className="font-semibold text-primary">
                {latest.summary.categoryPoints}/{latest.summary.totalCases}
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Action points:{" "}
              <span className="font-semibold text-primary">
                {latest.summary.actionPoints}/{latest.summary.totalCases}
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Intent points:{" "}
              <span className="font-semibold text-primary">
                {latest.summary.intentPoints}/{latest.summary.totalCases}
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3 md:col-span-2">
              <Link href={latest.runId ? `/reports/${latest.runId}` : "/reports"} className="font-semibold text-primary hover:underline">
                View full report and export markdown
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-surface-container-high/55 p-4 text-sm text-on-surface-variant">
            No evaluation run has been saved yet. Run a batch from the{" "}
            <Link href="/evaluation" className="font-semibold text-primary hover:underline">
              Evaluation tab
            </Link>{" "}
            to populate this section.
          </div>
        )}
      </section>

      <SampleRunner />
    </div>
  );
}
