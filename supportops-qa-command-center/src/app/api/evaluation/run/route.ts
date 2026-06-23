import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { applyGuardrails } from "@/lib/automation/guardrails";
import { defaultGoldDatasetPath } from "@/lib/evaluation/dashboard";
import { loadGoldCasesFromCsv, runGoldEvaluation } from "@/lib/evaluation/gold";
import { selectGoldCasesByPercentage } from "@/lib/evaluation/workspace";
import { analyzeTicketWithDeepSeek } from "@/lib/llm/deepseek";
import { DEFAULT_PROMPT_INSTRUCTIONS } from "@/lib/llm/prompt";
import { defaultPolicyTexts } from "@/lib/policies/defaults";

export const maxDuration = 300;

function goldEvalConcurrency(): number {
  const parsed = Number(process.env.GOLD_EVAL_CONCURRENCY ?? "5");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 5;
}

interface EvaluationRunRequest {
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
    const percentage = body.percentage ?? 25;
    const model = body.model?.trim() || process.env.DEEPSEEK_MODEL || "deepseek-chat";
    const promptInstructions = body.promptInstructions?.trim() || DEFAULT_PROMPT_INSTRUCTIONS;
    const datasetPath = defaultGoldDatasetPath();
    const allCases = loadGoldCasesFromCsv(await readGoldCsv(datasetPath));
    const cases = selectGoldCasesByPercentage(allCases, percentage);
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

    return NextResponse.json({
      generatedAt: generatedAt.toISOString(),
      model,
      percentage,
      promptInstructions,
      datasetPath,
      datasetCaseCount: allCases.length,
      evaluatedCaseCount: cases.length,
      summary: report.summary,
      failures: report.results
        .filter((result) => !result.score.passed)
        .slice(0, 10)
        .map((result) => ({
          caseId: result.case.id,
          failures: result.score.failures,
          expected: result.score.expected,
          actual: result.score.actual,
        })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Evaluation run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
