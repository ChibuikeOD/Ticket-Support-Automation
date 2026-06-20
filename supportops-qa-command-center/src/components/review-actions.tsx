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
        className="min-h-32 w-full rounded-md border border-slate-300 p-3 text-sm"
      />
      <input
        value={reviewerNotes}
        onChange={(event) => setReviewerNotes(event.target.value)}
        placeholder="Reviewer notes"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
          onClick={() => submit("approve")}
        >
          Approve
        </button>
        <button
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
          onClick={() => submit("edit_approve")}
        >
          Edit & Approve
        </button>
        <button
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white"
          onClick={() => submit("reject")}
        >
          Reject
        </button>
        <button
          className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white"
          onClick={() => submit("escalate")}
        >
          Escalate
        </button>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
