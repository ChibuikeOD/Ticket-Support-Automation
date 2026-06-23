import Link from "next/link";
import { ReviewActions } from "@/components/review-actions";
import { prisma } from "@/lib/db";

export default async function ReviewPage() {
  const analyses = await prisma.aiAnalysis.findMany({
    where: {
      ticket: {
        status: {
          in: ["human_review", "auto_resolved"],
        },
      },
    },
    include: { ticket: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">QA Review</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Approve, correct, reject, or escalate AI-handled tickets.
          </p>
        </div>
        <span className="echo-label w-fit rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-secondary">
          {analyses.length} Pending
        </span>
      </div>
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <aside className="glass-panel overflow-hidden rounded-3xl">
          <div className="border-b border-outline-variant/20 p-5">
            <h2 className="text-xl font-semibold">Pending Reviews</h2>
            <div className="mt-4 flex gap-2">
              <span className="echo-label rounded-full bg-primary-container px-3 py-1 text-white">All</span>
              <span className="echo-label rounded-full bg-surface-container-high px-3 py-1 text-on-surface-variant">
                High Priority
              </span>
            </div>
          </div>
          <div className="max-h-[680px] overflow-y-auto">
            {analyses.slice(0, 12).map((analysis, index) => (
              <Link
                href={`/tickets/${analysis.ticketId}`}
                key={analysis.id}
                className={`block border-b border-outline-variant/10 p-4 transition-colors hover:bg-surface-container-high ${
                  index === 0 ? "border-l-4 border-l-primary bg-primary/10" : ""
                }`}
              >
                <div className="flex justify-between gap-3">
                  <span className="echo-label text-primary">{analysis.ticket.externalId}</span>
                  <span className="text-xs text-outline">{Math.round(analysis.confidence * 100)}%</span>
                </div>
                <h3 className="mt-2 truncate font-semibold text-foreground">
                  {analysis.ticket.ticketSubject ?? analysis.ticket.externalId}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{analysis.summary}</p>
              </Link>
            ))}
          </div>
        </aside>
        <main className="space-y-5">
        {analyses.length === 0 ? (
          <div className="glass-panel rounded-2xl p-5 text-sm text-on-surface-variant">
            No stored tickets are ready for review. The primary dashboard sample run is stateless and does not create
            review queue items.
          </div>
        ) : (
          analyses.map((analysis) => (
            <section key={analysis.id} className="glass-panel rounded-2xl p-5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <div className="echo-label text-primary">{analysis.ticket.externalId}</div>
                  <h2 className="mt-1 text-xl font-semibold">
                    {analysis.ticket.ticketSubject ?? analysis.ticket.externalId}
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">{analysis.summary}</p>
                </div>
                <Link href={`/tickets/${analysis.ticketId}`} className="text-sm font-bold text-primary hover:underline">
                  View detail
                </Link>
              </div>
              <div className="mt-4">
                <ReviewActions
                  ticketId={analysis.ticketId}
                  aiAnalysisId={analysis.id}
                  draftResponse={analysis.draftResponse}
                />
              </div>
            </section>
          ))
        )}
        </main>
      </div>
    </div>
  );
}
