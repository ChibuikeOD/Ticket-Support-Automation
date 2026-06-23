import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GoldEvaluationReport, GoldEvaluationSummary } from "@/lib/evaluation/gold";
import { prisma } from "@/lib/db";

export interface EvaluationCaseResult {
  caseId: string;
  passed: boolean;
  pointsEarned: number;
  pointsPossible: number;
  failures: string[];
  matches: {
    category: boolean;
    customerIntent: boolean;
    finalAction: boolean;
  };
  ticket: {
    description: string;
    product: string | null;
    priority: string | null;
    channel: string | null;
  };
  expected: {
    category: string;
    customerIntent: string;
    finalAction: string;
  };
  actual: {
    category: string;
    customerIntent: string;
    finalAction: string;
    confidence: number;
    guardrailReasons: string[];
  };
}

export interface LatestGoldReport {
  generatedAt: string;
  model: string;
  promptVersion: string;
  datasetPath: string;
  batchSize?: number;
  source?: "cli" | "ui";
  summary: GoldEvaluationSummary;
  cases: EvaluationCaseResult[];
}

const LATEST_REPORT_FORMAT = "latest-gold-eval";
const GOLD_SCORE_DIMENSIONS = 3;

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function normalizeGoldEvaluationSummary(
  summary: Partial<GoldEvaluationSummary>,
  cases: EvaluationCaseResult[],
): GoldEvaluationSummary {
  const totalCases = summary.totalCases ?? cases.length;
  const categoryPoints =
    summary.categoryPoints ?? cases.filter((entry) => entry.matches?.category).length;
  const intentPoints =
    summary.intentPoints ?? cases.filter((entry) => entry.matches?.customerIntent).length;
  const actionPoints =
    summary.actionPoints ?? cases.filter((entry) => entry.matches?.finalAction).length;
  const matchedPoints =
    summary.matchedPoints ??
    cases.reduce((sum, entry) => sum + (entry.pointsEarned ?? 0), 0);
  const totalPoints =
    summary.totalPoints ??
    (cases.length > 0
      ? cases.reduce((sum, entry) => sum + (entry.pointsPossible ?? GOLD_SCORE_DIMENSIONS), 0)
      : totalCases * GOLD_SCORE_DIMENSIONS);
  const passedCases = summary.passedCases ?? cases.filter((entry) => entry.passed).length;

  return {
    totalCases,
    totalPoints,
    matchedPoints,
    scorePercent: summary.scorePercent ?? percent(matchedPoints, totalPoints),
    categoryPoints,
    intentPoints,
    actionPoints,
    passedCases,
    categoryAccuracy: summary.categoryAccuracy ?? percent(categoryPoints, totalCases),
    customerIntentAccuracy:
      summary.customerIntentAccuracy ?? percent(intentPoints, totalCases),
    finalActionAccuracy: summary.finalActionAccuracy ?? percent(actionPoints, totalCases),
  };
}

function normalizeLatestGoldReport(report: LatestGoldReport): LatestGoldReport {
  return {
    ...report,
    summary: normalizeGoldEvaluationSummary(report.summary, report.cases ?? []),
  };
}

export function resolveReportsDir(cwd = process.cwd()) {
  return process.env.EVALUATION_REPORTS_DIR
    ? path.resolve(process.env.EVALUATION_REPORTS_DIR)
    : path.resolve(cwd, "evaluation-reports");
}

export function defaultGoldDatasetPath(cwd = process.cwd()) {
  return process.env.GOLD_DATASET_PATH
    ? path.resolve(cwd, process.env.GOLD_DATASET_PATH)
    : path.resolve(cwd, "..", "Datasets", "gold_eval_clean_closed_sat5.csv");
}

export function mapGoldResultToCaseResult(
  result: GoldEvaluationReport["results"][number],
): EvaluationCaseResult {
  return {
    caseId: result.case.id,
    passed: result.score.passed,
    pointsEarned: result.score.pointsEarned,
    pointsPossible: result.score.pointsPossible,
    failures: result.score.failures,
    matches: result.score.matches,
    ticket: {
      description: result.case.ticket.description,
      product: result.case.ticket.product,
      priority: result.case.ticket.priority,
      channel: result.case.ticket.channel,
    },
    expected: {
      category: result.score.expected.category,
      customerIntent: result.score.expected.customerIntent,
      finalAction: result.score.expected.finalAction,
    },
    actual: {
      category: result.score.actual.category,
      customerIntent: result.score.actual.customerIntent,
      finalAction: result.score.actual.finalAction,
      confidence: result.score.actual.confidence,
      guardrailReasons: result.score.actual.guardrailReasons,
    },
  };
}

export function buildLatestGoldReport(options: {
  generatedAt: Date;
  model: string;
  promptVersion: string;
  datasetPath: string;
  batchSize?: number;
  source: "cli" | "ui";
  report: GoldEvaluationReport;
}): LatestGoldReport {
  return {
    generatedAt: options.generatedAt.toISOString(),
    model: options.model,
    promptVersion: options.promptVersion,
    datasetPath: options.datasetPath,
    batchSize: options.batchSize,
    source: options.source,
    summary: options.report.summary,
    cases: options.report.results.map(mapGoldResultToCaseResult),
  };
}

function isFilesystemPersistenceError(error: unknown) {
  const code = (error as NodeJS.ErrnoException).code;
  return code === "EROFS" || code === "EACCES" || code === "ENOENT";
}

async function persistLatestGoldReportToDatabase(content: string): Promise<boolean> {
  try {
    await prisma.reportExport.deleteMany({ where: { format: LATEST_REPORT_FORMAT } });
    await prisma.reportExport.create({
      data: {
        format: LATEST_REPORT_FORMAT,
        content,
      },
    });
    return true;
  } catch {
    // Database may be unavailable in local-only workflows.
    return false;
  }
}

async function persistLatestGoldReportToFilesystem(dir: string, content: string): Promise<boolean> {
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "latest-gold-eval.json"), content);
    return true;
  } catch (error) {
    if (isFilesystemPersistenceError(error)) return false;
    throw error;
  }
}

export async function saveLatestGoldReport(report: LatestGoldReport, reportsDir?: string) {
  const dir = reportsDir ?? resolveReportsDir();
  const content = JSON.stringify(report, null, 2);

  const [savedToDatabase, savedToFilesystem] = await Promise.all([
    persistLatestGoldReportToDatabase(content),
    persistLatestGoldReportToFilesystem(dir, content),
  ]);

  if (!savedToDatabase && !savedToFilesystem) {
    throw new Error("Failed to persist latest gold evaluation report");
  }
}

async function loadLatestGoldReportFromFilesystem(
  dir: string,
): Promise<LatestGoldReport | null> {
  try {
    return JSON.parse(
      await readFile(path.join(dir, "latest-gold-eval.json"), "utf8"),
    ) as LatestGoldReport;
  } catch (error) {
    if (!isFilesystemPersistenceError(error)) throw error;
    return null;
  }
}

async function loadLatestGoldReportFromDatabase(): Promise<LatestGoldReport | null> {
  try {
    const record = await prisma.reportExport.findFirst({
      where: { format: LATEST_REPORT_FORMAT },
      orderBy: { createdAt: "desc" },
    });

    return record ? (JSON.parse(record.content) as LatestGoldReport) : null;
  } catch {
    return null;
  }
}

export async function loadLatestGoldReport(reportsDir?: string): Promise<LatestGoldReport | null> {
  const dir = reportsDir ?? resolveReportsDir();
  const loaders = process.env.VERCEL
    ? [() => loadLatestGoldReportFromDatabase(), () => loadLatestGoldReportFromFilesystem(dir)]
    : [() => loadLatestGoldReportFromFilesystem(dir), () => loadLatestGoldReportFromDatabase()];

  for (const loader of loaders) {
    const report = await loader();
    if (report) {
      return normalizeLatestGoldReport(report);
    }
  }

  return null;
}
