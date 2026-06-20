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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Human Review Queue</h1>
        <p className="mt-1 text-sm text-slate-600">Approve, correct, reject, or escalate AI-handled tickets.</p>
      </div>
      <div className="space-y-4">
        {analyses.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            No tickets are ready for review. Run an automation batch first.
          </div>
        ) : (
          analyses.map((analysis) => (
            <section key={analysis.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <h2 className="font-semibold">{analysis.ticket.ticketSubject ?? analysis.ticket.externalId}</h2>
                  <p className="text-sm text-slate-600">{analysis.summary}</p>
                </div>
                <Link href={`/tickets/${analysis.ticketId}`} className="text-sm font-medium text-slate-950 hover:underline">
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
      </div>
    </div>
  );
}
