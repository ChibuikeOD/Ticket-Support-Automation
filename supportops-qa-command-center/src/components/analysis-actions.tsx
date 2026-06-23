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
        className="echo-gradient-button rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isRunning ? "Running..." : hasAnalysis ? "Rerun analysis" : "Run analysis"}
      </button>
      {hasAnalysis ? (
        <>
          <button
            type="button"
            onClick={() => deleteAnalyses("latest")}
            disabled={isRunning || isDeleting}
            className="echo-ghost-button rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
          >
            Delete latest analysis
          </button>
          <button
            type="button"
            onClick={() => deleteAnalyses("all")}
            disabled={isRunning || isDeleting}
            className="rounded-xl border border-error/30 bg-error/10 px-5 py-3 text-sm font-bold text-error transition-colors hover:bg-error/15 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Delete all analyses
          </button>
        </>
      ) : null}
      {message ? <span className="text-sm text-on-surface-variant">{message}</span> : null}
    </div>
  );
}
