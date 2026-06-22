"use client";

import { useState } from "react";

export function AnalysisActions({
  ticketId,
  hasAnalysis,
}: {
  ticketId: string;
  hasAnalysis: boolean;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runAnalysis() {
    setIsRunning(true);
    setMessage(null);
    const response = await fetch(`/api/tickets/${ticketId}/analysis/run`, {
      method: "POST",
    });
    const json = (await response.json()) as { processedCount?: number; error?: string };
    setIsRunning(false);
    setMessage(response.ok ? `Processed ${json.processedCount} ticket.` : (json.error ?? "Analysis failed"));
    if (response.ok) window.location.reload();
  }

  async function deleteAnalyses(scope: "latest" | "all") {
    setIsDeleting(true);
    setMessage(null);
    const response = await fetch(`/api/tickets/${ticketId}/analysis?scope=${scope}`, {
      method: "DELETE",
    });
    const json = (await response.json()) as { deletedCount?: number; error?: string };
    setIsDeleting(false);
    setMessage(response.ok ? `Deleted ${json.deletedCount} analysis record(s).` : (json.error ?? "Delete failed"));
    if (response.ok) window.location.reload();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={runAnalysis}
        disabled={isRunning || isDeleting}
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isRunning ? "Running..." : hasAnalysis ? "Rerun analysis" : "Run analysis"}
      </button>
      {hasAnalysis ? (
        <>
          <button
            type="button"
            onClick={() => deleteAnalyses("latest")}
            disabled={isRunning || isDeleting}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Delete latest analysis
          </button>
          <button
            type="button"
            onClick={() => deleteAnalyses("all")}
            disabled={isRunning || isDeleting}
            className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:text-red-300"
          >
            Delete all analyses
          </button>
        </>
      ) : null}
      {message ? <span className="text-sm text-slate-600">{message}</span> : null}
    </div>
  );
}
