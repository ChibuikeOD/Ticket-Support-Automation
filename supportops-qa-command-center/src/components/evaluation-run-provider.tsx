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

export interface EvaluationRunSummary {
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
}

export interface EvaluationRunResult {
  error?: string;
  generatedAt?: string;
  model?: string;
  percentage?: number;
  datasetCaseCount?: number;
  evaluatedCaseCount?: number;
  summary?: EvaluationRunSummary;
  failures?: Array<{
    caseId: string;
    failures: string[];
    expected: { finalAction: string; riskLevel: string; category: string };
    actual: { finalAction: string; riskLevel: string; category: string };
  }>;
}

export interface EvaluationRunParams {
  percentage: number;
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

function estimatedCaseCount(percentage: number): number {
  return Math.ceil(100 * (percentage / 100));
}

function EvaluationRunOverlay({
  params,
  startedAt,
}: {
  params: EvaluationRunParams;
  startedAt: number;
}) {
  const caseCount = estimatedCaseCount(params.percentage);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  const batchCount = Math.ceil(caseCount / 5);

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
          {params.model} · {params.percentage}% · ~{caseCount} DeepSeek calls
        </p>
        <p className="mt-3 text-sm text-on-surface-variant">
          Each ticket is analyzed by the LLM. Runs continue in the background if you switch tabs.
        </p>
        <p className="echo-label mt-4 text-xs text-outline">
          Elapsed {elapsedSeconds}s · ~{batchCount} parallel batches (5 at a time)
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
      const json = (await response.json()) as EvaluationRunResult;
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
