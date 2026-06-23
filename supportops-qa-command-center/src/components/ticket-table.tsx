import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

interface TicketRow {
  id: string;
  externalId: string;
  ticketSubject: string | null;
  ticketType: string | null;
  productPurchased: string | null;
  priority: string | null;
  channel: string | null;
  status: string;
}

export function TicketTable({ tickets }: { tickets: TicketRow[] }) {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
      <table className="min-w-[920px] divide-y divide-outline-variant/10">
        <thead className="bg-surface-container-low/60">
          <tr>
            <th className="echo-label px-6 py-4 text-left text-outline">Ticket</th>
            <th className="echo-label px-6 py-4 text-left text-outline">Type</th>
            <th className="echo-label px-6 py-4 text-left text-outline">Product</th>
            <th className="echo-label px-6 py-4 text-left text-outline">Priority</th>
            <th className="echo-label px-6 py-4 text-left text-outline">Channel</th>
            <th className="echo-label px-6 py-4 text-left text-outline">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="group transition-colors hover:bg-surface-container-high/45">
              <td className="px-6 py-5 text-sm">
                <Link className="font-semibold text-primary hover:underline" href={`/tickets/${ticket.id}`}>
                  {ticket.ticketSubject ?? `Ticket ${ticket.externalId}`}
                </Link>
                <div className="mt-1 font-mono text-xs text-outline">{ticket.externalId}</div>
              </td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">{ticket.ticketType ?? "Unknown"}</td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">{ticket.productPurchased ?? "Unknown"}</td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">{ticket.priority ?? "Unknown"}</td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">{ticket.channel ?? "Unknown"}</td>
              <td className="px-6 py-5 text-sm">
                <StatusBadge status={ticket.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
