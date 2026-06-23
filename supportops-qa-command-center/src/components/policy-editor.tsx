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
    <div className="glass-panel space-y-4 rounded-2xl p-5">
      <h2 className="text-xl font-bold text-foreground">Add policy rule</h2>
      <input
        className="echo-input w-full rounded-xl px-3 py-2 text-sm"
        placeholder="Policy name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        className="echo-input w-full rounded-xl px-3 py-2 text-sm"
        placeholder="Category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      />
      <select
        className="echo-input w-full rounded-xl px-3 py-2 text-sm"
        value={severity}
        onChange={(event) => setSeverity(event.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <textarea
        className="echo-input min-h-28 w-full rounded-xl p-3 text-sm"
        placeholder="Policy text"
        value={ruleText}
        onChange={(event) => setRuleText(event.target.value)}
      />
      <button className="echo-gradient-button rounded-xl px-5 py-3 text-sm font-bold" onClick={save}>
        Save policy
      </button>
      {message ? <p className="text-sm text-on-surface-variant">{message}</p> : null}
    </div>
  );
}
