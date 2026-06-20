"use client";

import { useState } from "react";

export function RunBatchButton({ ticketIds }: { ticketIds: string[] }) {
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runBatch() {
    setIsRunning(true);
    setMessage(null);
    const response = await fetch("/api/automation/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketIds, promptVersion: "v1" }),
    });
    const json = (await response.json()) as { processedCount?: number; error?: string };
    setIsRunning(false);
    setMessage(response.ok ? `Processed ${json.processedCount} tickets.` : (json.error ?? "Automation run failed"));
    if (response.ok) window.location.reload();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={runBatch}
        disabled={isRunning || ticketIds.length === 0}
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isRunning ? "Running..." : `Run batch (${ticketIds.length})`}
      </button>
      {message ? <span className="text-sm text-slate-600">{message}</span> : null}
    </div>
  );
}
