"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import type { EvaluationCaseResult } from "@/lib/evaluation/report-store";

type ResultFilter = "all" | "passed" | "failed";

function MatchBadge({ matched, label }: { matched: boolean; label: string }) {
  return (
    <span
      className={`echo-label inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${
        matched
          ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border border-error/30 bg-error/10 text-error"
      }`}
    >
      {matched ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

function ComparisonRow({
  label,
  expected,
  actual,
  matched,
}: {
  label: string;
  expected: string;
  actual: string;
  matched: boolean;
}) {
  return (
    <div className="grid gap-2 rounded-xl bg-surface-container-low/70 p-3 md:grid-cols-[7rem_1fr_1fr_4rem] md:items-center">
      <div className="echo-label text-outline">{label}</div>
      <div className="text-sm text-on-surface-variant">
        <span className="echo-label mb-1 block text-[10px] text-outline md:hidden">Gold</span>
        {expected}
      </div>
      <div className="text-sm text-foreground">
        <span className="echo-label mb-1 block text-[10px] text-outline md:hidden">LLM</span>
        {actual}
      </div>
      <div className="md:text-right">
        <MatchBadge matched={matched} label={matched ? "Match" : "Miss"} />
      </div>
    </div>
  );
}

function CaseResultCard({
  item,
  expanded,
  onToggle,
}: {
  item: EvaluationCaseResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        item.passed
          ? "border-emerald-400/20 bg-emerald-400/5"
          : "border-error/20 bg-error/5"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-surface-container-high/40"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-primary">{item.caseId}</span>
            <span
              className={`echo-label rounded-full px-2 py-0.5 text-[11px] ${
                item.passed
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-error/10 text-error"
              }`}
            >
              {item.passed ? "Passed" : "Failed"} · {item.pointsEarned}/{item.pointsPossible}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">{item.ticket.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <MatchBadge matched={item.matches.category} label="Category" />
            <MatchBadge matched={item.matches.customerIntent} label="Intent" />
            <MatchBadge matched={item.matches.finalAction} label="Action" />
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-outline-variant/20 px-4 pb-4 pt-4">
          <div>
            <h4 className="echo-label text-outline">Customer question</h4>
            <p className="mt-2 rounded-xl bg-surface-container-high/55 p-4 text-sm leading-6 text-foreground">
              {item.ticket.description}
            </p>
            <p className="mt-2 text-xs text-on-surface-variant">
              Product: {item.ticket.product ?? "Unknown"} · Priority: {item.ticket.priority ?? "Unknown"} ·
              Channel: {item.ticket.channel ?? "Unknown"}
            </p>
          </div>

          <div>
            <h4 className="echo-label text-outline">Gold vs LLM comparison</h4>
            <div className="mt-3 space-y-2">
              <ComparisonRow
                label="Category"
                expected={item.expected.category}
                actual={item.actual.category}
                matched={item.matches.category}
              />
              <ComparisonRow
                label="Intent"
                expected={item.expected.customerIntent}
                actual={item.actual.customerIntent}
                matched={item.matches.customerIntent}
              />
              <ComparisonRow
                label="Action"
                expected={item.expected.finalAction}
                actual={item.actual.finalAction}
                matched={item.matches.finalAction}
              />
            </div>
          </div>

          {item.actual.guardrailReasons.length > 0 ? (
            <div>
              <h4 className="echo-label text-outline">Guardrail notes</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
                {item.actual.guardrailReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-xs text-on-surface-variant">
            LLM confidence: {(item.actual.confidence * 100).toFixed(0)}%
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function EvaluationCaseResults({ cases }: { cases: EvaluationCaseResult[] }) {
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const filteredCases = useMemo(() => {
    if (filter === "passed") return cases.filter((item) => item.passed);
    if (filter === "failed") return cases.filter((item) => !item.passed);
    return cases;
  }, [cases, filter]);

  const passedCount = cases.filter((item) => item.passed).length;
  const failedCount = cases.length - passedCount;

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold">Case Results</h3>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", `All (${cases.length})`],
              ["passed", `Passed (${passedCount})`],
              ["failed", `Failed (${failedCount})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                filter === value
                  ? "echo-gradient-button"
                  : "border border-outline-variant/50 bg-surface-container-high/60 text-on-surface-variant"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-sm text-on-surface-variant">
        Click any case to see the customer question and a gold-vs-LLM comparison.
      </p>

      <div className="mt-4 space-y-3">
        {filteredCases.length ? (
          filteredCases.map((item) => (
            <CaseResultCard
              key={item.caseId}
              item={item}
              expanded={expandedCaseId === item.caseId}
              onToggle={() =>
                setExpandedCaseId((current) => (current === item.caseId ? null : item.caseId))
              }
            />
          ))
        ) : (
          <p className="text-sm text-on-surface-variant">No cases match this filter.</p>
        )}
      </div>
    </div>
  );
}
