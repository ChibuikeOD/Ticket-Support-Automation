"use client";

import { useState } from "react";

export function ReviewActions({
  ticketId,
  aiAnalysisId,
  draftResponse,
}: {
  ticketId: string;
  aiAnalysisId: string;
  draftResponse: string;
}) {
  const [editedResponse, setEditedResponse] = useState(draftResponse);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(action: "approve" | "edit_approve" | "reject" | "escalate") {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, aiAnalysisId, action, editedResponse, reviewerNotes }),
    });
    const json = (await response.json()) as { status?: string; error?: string };
    setMessage(response.ok ? `Saved review: ${json.status}` : (json.error ?? "Review save failed"));
    if (response.ok) window.location.reload();
  }

  return (
    <div className="space-y-3">
      <textarea
        value={editedResponse}
        onChange={(event) => setEditedResponse(event.target.value)}
        className="echo-input min-h-32 w-full rounded-xl p-4 text-sm"
      />
      <input
        value={reviewerNotes}
        onChange={(event) => setReviewerNotes(event.target.value)}
        placeholder="Reviewer notes"
        className="echo-input w-full rounded-xl px-4 py-3 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-400/20"
          onClick={() => submit("approve")}
        >
          Approve
        </button>
        <button
          className="echo-gradient-button rounded-xl px-4 py-2 text-sm font-bold"
          onClick={() => submit("edit_approve")}
        >
          Edit & Approve
        </button>
        <button
          className="rounded-xl border border-error/30 bg-error/10 px-4 py-2 text-sm font-bold text-error hover:bg-error/15"
          onClick={() => submit("reject")}
        >
          Reject
        </button>
        <button
          className="echo-ghost-button rounded-xl px-4 py-2 text-sm font-bold"
          onClick={() => submit("escalate")}
        >
          Escalate
        </button>
      </div>
      {message ? <p className="text-sm text-on-surface-variant">{message}</p> : null}
    </div>
  );
}
