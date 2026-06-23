import { loadGoldCasesFromCsv } from "@/lib/evaluation/gold";
import {
  defaultGoldDatasetPath,
  loadLatestGoldReport,
  type LatestGoldReport,
} from "@/lib/evaluation/report-store";

export type { LatestGoldReport };

interface LoadGoldDashboardSummaryOptions {
  datasetPath?: string;
  reportsDir?: string;
}

export { defaultGoldDatasetPath };

async function readGoldDatasetText(datasetPath: string) {
  const { readFile } = await import("node:fs/promises");

  try {
    return await readFile(datasetPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const url =
    process.env.GOLD_DATASET_URL ??
    "https://raw.githubusercontent.com/ChibuikeOD/Ticket-Support-Automation/main/Datasets/gold_eval_clean_closed_sat5.csv";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gold dataset request failed with status ${response.status}`);
  }

  return response.text();
}

export async function loadGoldDashboardSummary(options: LoadGoldDashboardSummaryOptions = {}) {
  const datasetPath = options.datasetPath ?? defaultGoldDatasetPath();
  const cases = loadGoldCasesFromCsv(await readGoldDatasetText(datasetPath));

  return {
    dataset: {
      path: datasetPath,
      caseCount: cases.length,
    },
    latestReport: await loadLatestGoldReport(options.reportsDir),
  };
}
