"use client";

import { useState } from "react";

export function PolicyEditor() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [severity, setSeverity] = useState("medium");
  const [ruleText, setRuleText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    const response = await fetch("/api/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, severity, ruleText, enabled: true }),
    });
    const json = (await response.json()) as { id?: string; error?: string };
    setMessage(response.ok ? `Saved policy ${json.id}` : (json.error ?? "Policy save failed"));
    if (response.ok) window.location.reload();
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold">Add policy rule</h2>
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        placeholder="Policy name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        placeholder="Category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      />
      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={severity}
        onChange={(event) => setSeverity(event.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <textarea
        className="min-h-28 w-full rounded-md border border-slate-300 p-3 text-sm"
        placeholder="Policy text"
        value={ruleText}
        onChange={(event) => setRuleText(event.target.value)}
      />
      <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" onClick={save}>
        Save policy
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
