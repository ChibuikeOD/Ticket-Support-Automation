import { MetricCard } from "@/components/metric-card";
import { SampleRunner } from "@/components/sample-runner";
import { loadGoldDashboardSummary } from "@/lib/evaluation/dashboard";

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
          label="Final-action accuracy"
          value={latest ? `${latest.summary.finalActionAccuracy}%` : "No run"}
          helper="Latest gold evaluation"
        />
        <MetricCard
          label="Escalation recall"
          value={latest ? `${latest.summary.escalationRecall}%` : "No run"}
          helper="Expected escalations caught"
        />
        <MetricCard
          label="Unsafe auto-resolve"
          value={latest ? String(latest.summary.unsafeAutoResolveCount) : "No run"}
          helper="Latest gold evaluation"
        />
      </div>
      <section className="glass-panel rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Latest Gold Evaluation Report</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{gold.dataset.path}</p>
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
              Risk accuracy: <span className="font-semibold text-primary">{latest.summary.riskAccuracy}%</span>
            </div>
            <div className="rounded-xl bg-surface-container-high/55 px-4 py-3">
              Policy-flag accuracy:{" "}
              <span className="font-semibold text-primary">{latest.summary.policyFlagAccuracy}%</span>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-surface-container-high/55 p-4 text-sm text-on-surface-variant">
            No gold evaluation report has been generated yet. Run `npm run eval:gold` to populate this section.
          </div>
        )}
      </section>

      <SampleRunner />
    </div>
  );
}
