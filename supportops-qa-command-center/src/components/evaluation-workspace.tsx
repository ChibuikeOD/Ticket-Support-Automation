"use client";

import { useState } from "react";
import { Play, SlidersHorizontal } from "lucide-react";
import { DEFAULT_PROMPT_INSTRUCTIONS } from "@/lib/llm/prompt";

const percentages = [25, 50, 75, 100];
const modelOptions = ["deepseek-chat", "deepseek-v4-pro", "deepseek-reasoner"];

interface EvaluationResponse {
  error?: string;
  generatedAt?: string;
  model?: string;
  percentage?: number;
  datasetCaseCount?: number;
  evaluatedCaseCount?: number;
  summary?: {
    totalCases: number;
    passedCases: number;
    categoryAccuracy: number;
    customerIntentAccuracy: number;
    riskAccuracy: number;
    finalActionAccuracy: number;
    policyFlagAccuracy: number;
    escalationRecall: number;
    unsafeAutoResolveCount: number;
    unsafeAutoResolveRate: number;
  };
  failures?: Array<{
    caseId: string;
    failures: string[];
    expected: { finalAction: string; riskLevel: string; category: string };
    actual: { finalAction: string; riskLevel: string; category: string };
  }>;
}

export function EvaluationWorkspace() {
  const [percentage, setPercentage] = useState(25);
  const [model, setModel] = useState("deepseek-chat");
  const [promptInstructions, setPromptInstructions] = useState(DEFAULT_PROMPT_INSTRUCTIONS);
  const [customModel, setCustomModel] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);

  async function runEvaluation() {
    setIsRunning(true);
    setResult(null);

    const response = await fetch("/api/evaluation/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        percentage,
        model: customModel.trim() || model,
        promptInstructions,
      }),
    });
    const json = (await response.json()) as EvaluationResponse;

    setResult(response.ok ? json : { error: json.error ?? "Evaluation run failed." });
    setIsRunning(false);
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Run Configuration</h2>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_0.8fr_1.4fr]">
          <div>
            <div className="echo-label text-outline">Dataset Portion</div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {percentages.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPercentage(value)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                    percentage === value
                      ? "echo-gradient-button"
                      : "border border-outline-variant/50 bg-surface-container-high/60 text-on-surface-variant"
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="echo-label text-outline" htmlFor="eval-model">
              Model
            </label>
            <select
              id="eval-model"
              className="echo-input mt-3 w-full rounded-xl px-3 py-2 text-sm"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            >
              {modelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              className="echo-input mt-3 w-full rounded-xl px-3 py-2 text-sm"
              placeholder="Custom model id"
              value={customModel}
              onChange={(event) => setCustomModel(event.target.value)}
            />
          </div>
          <div>
            <label className="echo-label text-outline" htmlFor="eval-prompt">
              Prompt Instructions
            </label>
            <textarea
              id="eval-prompt"
              className="echo-input mt-3 min-h-44 w-full rounded-xl p-3 text-sm leading-6"
              value={promptInstructions}
              onChange={(event) => setPromptInstructions(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={runEvaluation}
            disabled={isRunning}
            className="echo-gradient-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-current" />
            {isRunning ? "Running evaluation..." : `Run ${percentage}% evaluation`}
          </button>
          <span className="text-sm text-on-surface-variant">
            {percentage}% evaluates about {percentage} of 100 gold cases.
          </span>
        </div>
      </section>

      {result?.error ? (
        <section className="rounded-2xl border border-error/30 bg-error/10 p-5 text-sm text-error">
          {result.error}
        </section>
      ) : null}

      {result?.summary ? (
        <section className="glass-panel rounded-2xl p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-bold">Evaluation Results</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {result.model} evaluated {result.evaluatedCaseCount}/{result.datasetCaseCount} gold cases.
              </p>
            </div>
            <span className="echo-label rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              {result.percentage}% run
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Passed", `${result.summary.passedCases}/${result.summary.totalCases}`],
              ["Final action", `${result.summary.finalActionAccuracy}%`],
              ["Risk", `${result.summary.riskAccuracy}%`],
              ["Escalation recall", `${result.summary.escalationRecall}%`],
              ["Category", `${result.summary.categoryAccuracy}%`],
              ["Intent", `${result.summary.customerIntentAccuracy}%`],
              ["Policy flags", `${result.summary.policyFlagAccuracy}%`],
              ["Unsafe auto-resolve", String(result.summary.unsafeAutoResolveCount)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-surface-container-high/55 p-4">
                <div className="echo-label text-outline">{label}</div>
                <div className="mt-2 text-3xl font-bold text-primary">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold">Failure Examples</h3>
            <div className="mt-3 space-y-3">
              {result.failures?.length ? (
                result.failures.map((failure) => (
                  <div key={failure.caseId} className="rounded-xl bg-surface-container-high/55 p-4 text-sm">
                    <div className="font-bold text-primary">{failure.caseId}</div>
                    <div className="mt-1 text-on-surface-variant">Failures: {failure.failures.join(", ")}</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <div>Expected: {failure.expected.finalAction}, {failure.expected.riskLevel}, {failure.expected.category}</div>
                      <div>Actual: {failure.actual.finalAction}, {failure.actual.riskLevel}, {failure.actual.category}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">No failures in this run.</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
