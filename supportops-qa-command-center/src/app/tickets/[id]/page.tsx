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
        take: 1,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {ticket.ticketSubject ?? `Ticket ${ticket.externalId}`}
        </h1>
        <div className="mt-2">
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Customer ticket</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-slate-500">Type</dt>
            <dd>{ticket.ticketType ?? "Unknown"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Product</dt>
            <dd>{ticket.productPurchased ?? "Unknown"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Priority</dt>
            <dd>{ticket.priority ?? "Unknown"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Channel</dt>
            <dd>{ticket.channel ?? "Unknown"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-slate-700">{ticket.ticketDescription}</p>
      </section>
      {latest ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Latest AI analysis</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="text-xs uppercase text-slate-500">Summary</div>
              <p className="mt-1 text-sm text-slate-700">{latest.summary}</p>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Draft response</div>
              <p className="mt-1 text-sm text-slate-700">{latest.draftResponse}</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase text-slate-500">Category</dt>
              <dd>{latest.issueCategory}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Risk</dt>
              <dd>{latest.riskLevel}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Confidence</dt>
              <dd>{Math.round(latest.confidence * 100)}%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Final action</dt>
              <dd>{latest.finalAction}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <h3 className="text-sm font-medium">Guardrail reasons</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {guardrailReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium">Policy checks</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {policyChecks.map((check) => (
                <li key={`${check.policy}-${check.status}`} className="rounded-md bg-slate-50 p-3">
                  <div className="font-medium">
                    {check.policy} - {check.status}
                  </div>
                  <div>{check.reason}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No AI analysis yet. Run a batch from the backlog.
        </section>
      )}
    </div>
  );
}
