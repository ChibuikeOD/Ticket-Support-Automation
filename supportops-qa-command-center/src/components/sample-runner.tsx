"use client";

import { useState } from "react";
import { Play, ShieldCheck } from "lucide-react";
import type { AiAnalysisResult, GuardrailDecision } from "@/lib/types";

interface SampleRunResponse {
  error?: string;
  datasetPath?: string;
  model?: string;
  ticket?: {
    externalId: string;
    subject: string | null;
    description: string;
    product: string | null;
    priority: string | null;
    channel: string | null;
    status: string | null;
  };
  analysis?: AiAnalysisResult;
  decision?: GuardrailDecision;
}

export function SampleRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SampleRunResponse | null>(null);

  async function runSample() {
    setIsRunning(true);
    setResult(null);

    const response = await fetch("/api/sample-run", {
      method: "POST",
    });
    const json = (await response.json()) as SampleRunResponse;

    setIsRunning(false);
    setResult(response.ok ? json : { error: json.error ?? "Sample run failed." });
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sample Run</h2>
          <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">
            Run one open ticket from Datasets/customer_support_tickets_200k.csv through the LLM and guardrails.
          </p>
        </div>
        <button
          type="button"
          onClick={runSample}
          disabled={isRunning}
          className="echo-gradient-button inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Play className="h-4 w-4 fill-current" />
          {isRunning ? "Running one ticket..." : "Run one open ticket"}
        </button>
      </div>

      {result?.error ? (
        <div className="mt-5 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          {result.error}
        </div>
      ) : null}

      {result?.ticket && result.analysis && result.decision ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-xl bg-surface-container-high/55 p-5">
            <div className="echo-label text-outline">Open Ticket {result.ticket.externalId}</div>
            <h3 className="mt-2 text-xl font-bold text-primary">
              {result.ticket.subject ?? "No subject"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">{result.ticket.description}</p>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <span>Product: {result.ticket.product ?? "Unknown"}</span>
              <span>Priority: {result.ticket.priority ?? "Unknown"}</span>
              <span>Channel: {result.ticket.channel ?? "Unknown"}</span>
              <span>Status: {result.ticket.status ?? "Unknown"}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-high/55 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="echo-label text-outline">LLM + Guardrail Result</div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {result.decision.finalAction.replace("_", " ")}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <div className="echo-label text-outline">Category</div>
                <div className="mt-1 font-semibold">{result.analysis.issueCategory}</div>
              </div>
              <div>
                <div className="echo-label text-outline">Intent</div>
                <div className="mt-1 font-semibold">{result.analysis.customerIntent}</div>
              </div>
              <div>
                <div className="echo-label text-outline">Risk</div>
                <div className="mt-1 font-semibold">{result.analysis.riskLevel}</div>
              </div>
              <div>
                <div className="echo-label text-outline">Confidence</div>
                <div className="mt-1 font-semibold">{Math.round(result.analysis.confidence * 100)}%</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="echo-label text-outline">Draft Response</div>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{result.analysis.draftResponse}</p>
            </div>
            <div className="mt-4">
              <div className="echo-label text-outline">Guardrail Reasons</div>
              <ul className="mt-2 space-y-2 text-sm text-on-surface-variant">
                {result.decision.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
