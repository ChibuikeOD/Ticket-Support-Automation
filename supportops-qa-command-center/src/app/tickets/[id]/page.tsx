import { AnalysisActions } from "@/components/analysis-actions";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket) notFound();

  const latest = ticket.analyses[0];
  const policyChecks = latest
    ? (JSON.parse(latest.policyChecksJson) as Array<{ policy: string; status: string; reason: string }>)
    : [];
  const guardrailReasons = latest ? (JSON.parse(latest.guardrailReasonsJson) as string[]) : [];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="glass-panel rounded-3xl p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={ticket.status} />
            <span className="echo-label rounded-full bg-surface-container-highest px-3 py-1 text-on-surface-variant">
              {ticket.externalId}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary">
            {ticket.ticketSubject ?? `Ticket ${ticket.externalId}`}
          </h1>
          <dl className="mt-6 grid gap-4 border-y border-outline-variant/10 py-6 sm:grid-cols-4">
            {[
              ["Type", ticket.ticketType ?? "Unknown"],
              ["Product", ticket.productPurchased ?? "Unknown"],
              ["Priority", ticket.priority ?? "Unknown"],
              ["Channel", ticket.channel ?? "Unknown"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="echo-label text-outline">{label}</dt>
                <dd className="mt-1 font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <div className="echo-label text-outline">Customer Message</div>
            <p className="mt-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 text-sm leading-6 text-on-surface-variant">
              {ticket.ticketDescription}
            </p>
          </div>
        </section>
        <section className="glass-panel rounded-3xl p-6">
          <h2 className="text-xl font-bold text-primary">Diagnostic Actions</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Run this ticket through DeepSeek again, or delete analysis history for a clean demo reset.
          </p>
          <div className="mt-6">
            <AnalysisActions ticketId={ticket.id} hasAnalysis={Boolean(latest)} />
          </div>
          <div className="mt-8 border-t border-outline-variant/10 pt-6">
            <div className="flex items-center justify-between">
              <span className="echo-label text-on-surface-variant">Last Audit Status</span>
              <span className="echo-label rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                {latest ? "Success" : "Ready"}
              </span>
            </div>
          </div>
        </section>
      </div>

      {latest ? (
        <section className="glass-panel echo-glow overflow-hidden rounded-3xl">
          <div className="flex flex-col justify-between gap-4 border-b border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Echo Insights</h2>
              <p className="echo-label mt-1 text-primary/80">Autonomous Diagnostic Engine</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-right">
                <div className="echo-label text-outline">Confidence</div>
                <div className="text-3xl font-bold text-primary">{Math.round(latest.confidence * 100)}%</div>
              </div>
              <div className="text-right">
                <div className="echo-label text-outline">Risk</div>
                <div className="text-3xl font-bold text-error">{latest.riskLevel}</div>
              </div>
            </div>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <article className="glass-panel rounded-2xl border-l-2 border-l-primary p-5">
              <div className="echo-label text-primary">Root Cause Identification</div>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">{latest.summary}</p>
            </article>
            <article className="glass-panel rounded-2xl border-l-2 border-l-primary p-5">
              <div className="echo-label text-primary">Draft Response</div>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">{latest.draftResponse}</p>
            </article>
            <article className="glass-panel rounded-2xl border-l-2 border-l-primary p-5">
              <div className="echo-label text-primary">Echo Recommendation</div>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-variant">Category</dt>
                  <dd className="font-semibold">{latest.issueCategory}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-variant">Final action</dt>
                  <dd className="font-semibold">{latest.finalAction}</dd>
                </div>
              </dl>
            </article>
          </div>
          <div className="grid gap-6 px-6 pb-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-highest/30 p-5">
              <h3 className="echo-label text-secondary">Guardrail Reasons</h3>
              <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                {guardrailReasons.map((reason) => (
                  <li key={reason} className="flex gap-2">
                    <span className="text-primary">-</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-highest/30 p-5">
              <h3 className="echo-label text-secondary">Policy Checks</h3>
              <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                {policyChecks.map((check) => (
                  <li key={`${check.policy}-${check.status}`} className="rounded-xl bg-surface-container-low p-3">
                    <div className="font-semibold text-foreground">
                      {check.policy} - {check.status}
                    </div>
                    <div>{check.reason}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <section className="glass-panel rounded-2xl p-5 text-sm text-on-surface-variant">
          No stored AI analysis yet. Use the dashboard sample run for the simplified one-ticket workflow.
        </section>
      )}

      {ticket.analyses.length > 1 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Analysis History</h2>
          <div className="space-y-3">
            {ticket.analyses.map((analysis) => (
              <div key={analysis.id} className="glass-panel rounded-2xl p-4 text-sm">
                <div className="font-semibold">{analysis.issueCategory}</div>
                <div className="mt-1 text-on-surface-variant">
                  {Math.round(analysis.confidence * 100)}% confidence - final action {analysis.finalAction}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
