import { RunBatchButton } from "@/components/run-batch-button";
import { TicketTable } from "@/components/ticket-table";
import { prisma } from "@/lib/db";

export default async function BacklogPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      externalId: true,
      ticketSubject: true,
      ticketType: true,
      productPurchased: true,
      priority: true,
      channel: true,
      status: true,
    },
  });
  const runnableIds = tickets
    .filter((ticket) => ticket.status === "seeded")
    .slice(0, 10)
    .map((ticket) => ticket.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ticket Backlog</h1>
          <p className="mt-1 text-sm text-slate-600">Seeded support tickets ready for AI analysis.</p>
        </div>
        <RunBatchButton ticketIds={runnableIds} />
      </div>
      {tickets.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No seeded tickets found. Run `npm run db:seed` to load the demo dataset.
        </div>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}
