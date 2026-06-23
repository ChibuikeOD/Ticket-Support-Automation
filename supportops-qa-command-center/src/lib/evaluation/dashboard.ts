import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadGoldCasesFromCsv, type GoldEvaluationSummary } from "@/lib/evaluation/gold";

export interface LatestGoldReport {
  generatedAt: string;
  model: string;
  promptVersion: string;
  datasetPath: string;
  summary: GoldEvaluationSummary;
}

interface LoadGoldDashboardSummaryOptions {
  datasetPath?: string;
  reportsDir?: string;
}

export function defaultGoldDatasetPath(cwd = process.cwd()) {
  return process.env.GOLD_DATASET_PATH
    ? path.resolve(cwd, process.env.GOLD_DATASET_PATH)
    : path.resolve(cwd, "..", "Datasets", "gold_eval_clean_closed_sat5.csv");
}

async function readLatestReport(reportsDir: string): Promise<LatestGoldReport | null> {
  try {
    return JSON.parse(await readFile(path.join(reportsDir, "latest-gold-eval.json"), "utf8")) as LatestGoldReport;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function loadGoldDashboardSummary(options: LoadGoldDashboardSummaryOptions = {}) {
  const datasetPath = options.datasetPath ?? defaultGoldDatasetPath();
  const reportsDir = options.reportsDir ?? path.resolve(process.cwd(), "evaluation-reports");
  const cases = loadGoldCasesFromCsv(await readFile(datasetPath, "utf8"));

  return {
    dataset: {
      path: datasetPath,
      caseCount: cases.length,
    },
    latestReport: await readLatestReport(reportsDir),
  };
}
