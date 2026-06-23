"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { DEFAULT_GOLD_EVAL_CONCURRENCY } from "@/lib/evaluation/workspace";
import type { EvaluationCaseResult } from "@/lib/evaluation/report-store";

export interface EvaluationRunSummary {
  totalCases: number;
  totalPoints: number;
  matchedPoints: number;
  scorePercent: number;
  categoryPoints: number;
  intentPoints: number;
  actionPoints: number;
  passedCases: number;
  categoryAccuracy: number;
  customerIntentAccuracy: number;
  finalActionAccuracy: number;
}

export interface EvaluationRunResult {
  error?: string;
  generatedAt?: string;
  model?: string;
  batchSize?: number;
  sampledCaseIds?: string[];
  datasetCaseCount?: number;
  evaluatedCaseCount?: number;
  summary?: EvaluationRunSummary;
  cases?: EvaluationCaseResult[];
}

export interface EvaluationRunParams {
  batchSize: number;
  model: string;
  promptInstructions: string;
}

interface EvaluationRunState {
  isRunning: boolean;
  startedAt: number | null;
  params: EvaluationRunParams | null;
  result: EvaluationRunResult | null;
}

interface EvaluationRunContextValue extends EvaluationRunState {
  runEvaluation: (params: EvaluationRunParams) => Promise<EvaluationRunResult>;
  clearResult: () => void;
}

const EvaluationRunContext = createContext<EvaluationRunContextValue | null>(null);

async function parseEvaluationResponse(response: Response): Promise<EvaluationRunResult> {
  const text = await response.text();

  try {
    return JSON.parse(text) as EvaluationRunResult;
  } catch {
    const preview = text.trim().slice(0, 200);
    if (response.status === 504 || response.status === 408) {
      throw new Error(
        "Evaluation timed out on the server. Try a smaller batch (5 cases) or a faster model like deepseek-chat.",
      );
    }

    throw new Error(
      preview.startsWith("An error")
        ? `Server error (${response.status}): ${preview}`
        : `Server returned a non-JSON response (${response.status}): ${preview || "empty body"}`,
    );
  }
}

function EvaluationRunOverlay({
  params,
  startedAt,
}: {
  params: EvaluationRunParams;
  startedAt: number;
}) {
  const caseCount = params.batchSize;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  const batchCount = Math.ceil(caseCount / DEFAULT_GOLD_EVAL_CONCURRENCY);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/70 p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Evaluation in progress"
    >
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 text-center shadow-2xl shadow-black/40">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold text-foreground">Running gold evaluation</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          {params.model} · {caseCount} random gold cases · {DEFAULT_GOLD_EVAL_CONCURRENCY} parallel calls
        </p>
        <p className="mt-3 text-sm text-on-surface-variant">
          Each ticket is analyzed by the LLM. Runs continue in the background if you switch tabs.
        </p>
        <p className="echo-label mt-4 text-xs text-outline">
          Elapsed {elapsedSeconds}s · ~{batchCount} parallel batches ({DEFAULT_GOLD_EVAL_CONCURRENCY} at a time)
        </p>
      </div>
    </div>
  );
}

export function EvaluationRunProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EvaluationRunState>({
    isRunning: false,
    startedAt: null,
    params: null,
    result: null,
  });

  useEffect(() => {
    void fetch("/api/evaluation/latest")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: EvaluationRunResult | null) => {
        if (!data?.summary || !data.cases?.length) return;

        setState((current) => (current.result ? current : { ...current, result: data }));
      })
      .catch(() => {
        // Ignore hydration errors when no prior run exists.
      });
  }, []);

  const runEvaluation = useCallback(async (params: EvaluationRunParams): Promise<EvaluationRunResult> => {
    setState({
      isRunning: true,
      startedAt: Date.now(),
      params,
      result: null,
    });

    try {
      const response = await fetch("/api/evaluation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const json = await parseEvaluationResponse(response);
      const result = response.ok ? json : { error: json.error ?? "Evaluation run failed." };

      setState({
        isRunning: false,
        startedAt: null,
        params: null,
        result,
      });

      return result;
    } catch (error) {
      const result = {
        error: error instanceof Error ? error.message : "Evaluation run failed.",
      };

      setState({
        isRunning: false,
        startedAt: null,
        params: null,
        result,
      });

      return result;
    }
  }, []);

  const clearResult = useCallback(() => {
    setState((current) => ({ ...current, result: null }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      runEvaluation,
      clearResult,
    }),
    [state, runEvaluation, clearResult],
  );

  return (
    <EvaluationRunContext.Provider value={value}>
      {children}
      {state.isRunning && state.params && state.startedAt ? (
        <EvaluationRunOverlay params={state.params} startedAt={state.startedAt} />
      ) : null}
    </EvaluationRunContext.Provider>
  );
}

export function useEvaluationRun() {
  const context = useContext(EvaluationRunContext);
  if (!context) {
    throw new Error("useEvaluationRun must be used within EvaluationRunProvider");
  }
  return context;
}
