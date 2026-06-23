import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { applyGuardrails } from "@/lib/automation/guardrails";
import { loadGoldCasesFromCsv, runGoldEvaluation } from "@/lib/evaluation/gold";
import {
  buildLatestGoldReport,
  defaultGoldDatasetPath,
  mapGoldResultToCaseResult,
  saveLatestGoldReport,
} from "@/lib/evaluation/report-store";
import { selectRandomGoldCases, DEFAULT_GOLD_EVAL_CONCURRENCY } from "@/lib/evaluation/workspace";
import { analyzeTicketWithDeepSeek } from "@/lib/llm/deepseek";
import { DEFAULT_PROMPT_INSTRUCTIONS } from "@/lib/llm/prompt";
import { defaultPolicyTexts } from "@/lib/policies/defaults";

export const maxDuration = 300;

function goldEvalConcurrency(): number {
  const parsed = Number(process.env.GOLD_EVAL_CONCURRENCY ?? String(DEFAULT_GOLD_EVAL_CONCURRENCY));
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_GOLD_EVAL_CONCURRENCY;
}

interface EvaluationRunRequest {
  batchSize?: number;
  /** @deprecated use batchSize */
  percentage?: number;
  model?: string;
  promptInstructions?: string;
}

async function readGoldCsv(datasetPath: string) {
  try {
    return await readFile(datasetPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const response = await fetch(
    process.env.GOLD_DATASET_URL ??
      "https://raw.githubusercontent.com/ChibuikeOD/Ticket-Support-Automation/main/Datasets/gold_eval_clean_closed_sat5.csv",
  );

  if (!response.ok) {
    throw new Error(`Gold dataset request failed with status ${response.status}`);
  }

  return response.text();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvaluationRunRequest;
    const batchSize = body.batchSize ?? body.percentage ?? 5;
    const model = body.model?.trim() || process.env.DEEPSEEK_MODEL || "deepseek-chat";
    const promptInstructions = body.promptInstructions?.trim() || DEFAULT_PROMPT_INSTRUCTIONS;
    const datasetPath = defaultGoldDatasetPath();
    const allCases = loadGoldCasesFromCsv(await readGoldCsv(datasetPath));
    const cases = selectRandomGoldCases(allCases, batchSize);
    const generatedAt = new Date();

    const report = await runGoldEvaluation({
      cases,
      policies: defaultPolicyTexts(),
      confidenceThreshold: Number(process.env.AUTOMATION_CONFIDENCE_THRESHOLD ?? "0.82"),
      concurrency: goldEvalConcurrency(),
      applyDecision: applyGuardrails,
      analyzeTicket: (ticket, policies) =>
        analyzeTicketWithDeepSeek({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
          model,
          promptInstructions,
          ticket,
          policies,
        }),
    });

    const latestReport = buildLatestGoldReport({
      generatedAt,
      model,
      promptVersion: process.env.GOLD_EVAL_PROMPT_VERSION ?? "ui",
      datasetPath,
      batchSize,
      source: "ui",
      report,
    });

    const runId = await saveLatestGoldReport(latestReport);

    return NextResponse.json({
      generatedAt: latestReport.generatedAt,
      runId,
      model,
      batchSize,
      sampledCaseIds: cases.map((goldCase) => goldCase.id),
      promptInstructions,
      datasetPath,
      datasetCaseCount: allCases.length,
      evaluatedCaseCount: cases.length,
      summary: report.summary,
      cases: report.results.map(mapGoldResultToCaseResult),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Evaluation run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
