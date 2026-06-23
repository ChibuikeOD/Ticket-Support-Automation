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

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Stored Tickets</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Legacy imported tickets are shown here for reference. New sample runs happen one ticket at a time from
            the dashboard.
          </p>
        </div>
      </div>
      <section className="glass-panel border-l-2 border-l-primary p-5 rounded-r-2xl">
        <div className="echo-label text-primary">Echo Insight</div>
        <p className="mt-2 max-w-3xl italic text-on-surface-variant">
          Batch automation is no longer the main workflow. Use the dashboard sample run to inspect one open CSV ticket
          at a time.
        </p>
      </section>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel rounded-2xl p-6">
          <div className="echo-label text-outline">Total Tickets</div>
          <div className="mt-2 text-4xl font-bold text-primary">{tickets.length}</div>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <div className="echo-label text-outline">Primary Workflow</div>
          <div className="mt-2 text-4xl font-bold text-secondary">Sample</div>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <div className="echo-label text-outline">Queue State</div>
          <div className="mt-2 text-4xl font-bold text-foreground">Live</div>
        </div>
      </div>
      {tickets.length === 0 ? (
        <div className="glass-panel rounded-2xl p-5 text-sm text-on-surface-variant">
          No seeded tickets found. Run `npm run db:seed` to load the demo dataset.
        </div>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}
