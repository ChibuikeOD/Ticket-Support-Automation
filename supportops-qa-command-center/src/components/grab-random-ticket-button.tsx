"use client";

import { useState } from "react";

export function GrabRandomTicketButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function grabTicket() {
    setIsLoading(true);
    setMessage(null);
    const response = await fetch("/api/dataset/random-ticket", {
      method: "POST",
    });
    const json = (await response.json()) as {
      ticket?: { externalId: string; ticketSubject: string | null };
      error?: string;
      isFullDataset?: boolean;
    };
    setIsLoading(false);

    if (!response.ok) {
      setMessage(json.error ?? "Could not import a random ticket.");
      return;
    }

    const source = json.isFullDataset ? "full dataset" : "sample dataset";
    setMessage(`Imported ${json.ticket?.ticketSubject ?? `ticket ${json.ticket?.externalId}`} from the ${source}.`);
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        type="button"
        onClick={grabTicket}
        disabled={isLoading}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-sm disabled:cursor-not-allowed disabled:text-slate-400"
      >
        {isLoading ? "Importing..." : "Grab random dataset ticket"}
      </button>
      {message ? <span className="max-w-sm text-sm text-slate-600">{message}</span> : null}
    </div>
  );
}
