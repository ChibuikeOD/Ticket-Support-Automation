import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { applyGuardrails } from "@/lib/automation/guardrails";
import { analyzeTicketWithDeepSeek } from "@/lib/llm/deepseek";
import {
  buildGoldEvaluationMarkdown,
  loadGoldCasesFromCsv,
  runGoldEvaluation,
} from "@/lib/evaluation/gold";
import { defaultPolicyTexts } from "@/lib/policies/defaults";

async function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");

  try {
    const text = await readFile(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) {
        process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // The script can still run when env vars are provided by the shell.
  }
}

function defaultGoldDatasetPath() {
  return path.resolve(process.cwd(), "..", "Datasets", "gold_eval_clean_closed_sat5.csv");
}

async function main() {
  await loadDotEnv();

  const datasetPath = process.env.GOLD_DATASET_PATH ?? defaultGoldDatasetPath();
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const promptVersion = process.env.GOLD_EVAL_PROMPT_VERSION ?? "v1";
  const confidenceThreshold = Number(process.env.AUTOMATION_CONFIDENCE_THRESHOLD ?? "0.82");
  const limit = process.env.GOLD_EVAL_LIMIT ? Number(process.env.GOLD_EVAL_LIMIT) : undefined;
  const csv = await readFile(datasetPath, "utf8");
  const cases = loadGoldCasesFromCsv(csv).slice(0, limit);

  if (cases.length === 0) {
    throw new Error("Gold dataset did not contain any eval cases.");
  }

  const report = await runGoldEvaluation({
    cases,
    policies: defaultPolicyTexts(),
    confidenceThreshold,
    concurrency: Number(process.env.GOLD_EVAL_CONCURRENCY ?? "5") || 5,
    applyDecision: applyGuardrails,
    analyzeTicket: (ticket, policies) =>
      analyzeTicketWithDeepSeek({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
        model,
        ticket,
        policies,
      }),
  });

  const outputDir = path.resolve(process.cwd(), "evaluation-reports");
  await mkdir(outputDir, { recursive: true });

  const generatedAt = new Date();
  const stamp = generatedAt.toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(outputDir, `gold-eval-${stamp}.json`);
  const markdownPath = path.join(outputDir, `gold-eval-${stamp}.md`);
  const latestJsonPath = path.join(outputDir, "latest-gold-eval.json");
  const latestMarkdownPath = path.join(outputDir, "latest-gold-eval.md");
  const markdown = buildGoldEvaluationMarkdown({
    report,
    model,
    promptVersion,
    datasetPath,
    generatedAt,
  });

  const payload = JSON.stringify(
    {
      generatedAt: generatedAt.toISOString(),
      model,
      promptVersion,
      datasetPath,
      confidenceThreshold,
      summary: report.summary,
      results: report.results,
    },
    null,
    2,
  );

  await Promise.all([
    writeFile(jsonPath, payload),
    writeFile(markdownPath, markdown),
    writeFile(latestJsonPath, payload),
    writeFile(latestMarkdownPath, markdown),
  ]);

  console.log(`Gold cases evaluated: ${report.summary.totalCases}`);
  console.log(`Final-action accuracy: ${report.summary.finalActionAccuracy}%`);
  console.log(`Escalation recall: ${report.summary.escalationRecall}%`);
  console.log(`Unsafe auto-resolve count: ${report.summary.unsafeAutoResolveCount}`);
  console.log(`JSON report: ${jsonPath}`);
  console.log(`Markdown report: ${markdownPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
