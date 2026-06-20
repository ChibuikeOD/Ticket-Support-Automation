import { MetricCard } from "@/components/metric-card";
import { calculateOverviewMetrics } from "@/lib/automation/metrics";
import { prisma } from "@/lib/db";

export default async function OverviewPage() {
  const [tickets, reviews, analyses] = await Promise.all([
    prisma.ticket.findMany({ select: { status: true } }),
    prisma.reviewDecision.findMany({ select: { action: true } }),
    prisma.aiAnalysis.findMany({ select: { confidence: true, issueCategory: true } }),
  ]);
  const metrics = calculateOverviewMetrics({ tickets, reviews, analyses });
  const topCategories = Object.entries(
    analyses.reduce<Record<string, number>>((acc, analysis) => {
      acc[analysis.issueCategory] = (acc[analysis.issueCategory] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Monitor automation coverage, review quality, and model confidence.
        </p>
      </div>
      {!process.env.DEEPSEEK_API_KEY ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          DeepSeek API key is not configured. Add DEEPSEEK_API_KEY to .env before running live automation.
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Tickets" value={String(metrics.totalTickets)} />
        <MetricCard label="Auto-resolution" value={`${metrics.autoResolutionRate}%`} />
        <MetricCard label="Human review" value={`${metrics.humanReviewRate}%`} />
        <MetricCard label="Escalation" value={`${metrics.escalationRate}%`} />
        <MetricCard label="Human approval" value={`${metrics.humanApprovalRate}%`} />
        <MetricCard label="Correction" value={`${metrics.correctionRate}%`} />
        <MetricCard label="Rejection" value={`${metrics.rejectionRate}%`} />
        <MetricCard label="Avg confidence" value={`${metrics.averageConfidence}%`} />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Top issue categories</h2>
        <div className="mt-4 space-y-3">
          {topCategories.length === 0 ? (
            <p className="text-sm text-slate-500">Run an automation batch to populate category metrics.</p>
          ) : (
            topCategories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span>{category}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
