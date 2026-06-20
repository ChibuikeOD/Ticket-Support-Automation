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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Ticket</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Product</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Channel</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-4 py-3 text-sm">
                <Link className="font-medium text-slate-950 hover:underline" href={`/tickets/${ticket.id}`}>
                  {ticket.ticketSubject ?? `Ticket ${ticket.externalId}`}
                </Link>
                <div className="text-xs text-slate-500">{ticket.externalId}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{ticket.ticketType ?? "Unknown"}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{ticket.productPurchased ?? "Unknown"}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{ticket.priority ?? "Unknown"}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{ticket.channel ?? "Unknown"}</td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={ticket.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
