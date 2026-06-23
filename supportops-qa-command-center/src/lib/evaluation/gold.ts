import Papa from "papaparse";
import type { AiAnalysisResult, GuardrailDecision, RecommendedAction, RiskLevel } from "@/lib/types";

export interface GoldCase {
  id: string;
  sourceTicketId: string;
  ticket: {
    id: string;
    description: string;
    subject: string | null;
    product: string | null;
    priority: string | null;
    channel: string | null;
  };
  expected: {
    category: string;
    customerIntent: string;
    resolutionNotes: string;
    policyFlags: string[];
    riskLevel: RiskLevel;
    finalAction: RecommendedAction;
  };
}

export interface ActualGoldResult {
  analysis: AiAnalysisResult;
  finalAction: RecommendedAction;
  guardrailReasons: string[];
}

export interface GoldCaseScore {
  caseId: string;
  sourceTicketId: string;
  passed: boolean;
  pointsEarned: number;
  pointsPossible: number;
  failures: string[];
  matches: {
    category: boolean;
    customerIntent: boolean;
    finalAction: boolean;
  };
  expected: Pick<GoldCase["expected"], "category" | "customerIntent" | "finalAction">;
  actual: {
    category: string;
    customerIntent: string;
    finalAction: RecommendedAction;
    confidence: number;
    guardrailReasons: string[];
  };
}

export interface GoldEvaluationSummary {
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

export interface GoldEvaluationReport {
  summary: GoldEvaluationSummary;
  results: Array<{
    case: GoldCase;
    actual: ActualGoldResult;
    score: GoldCaseScore;
  }>;
}

interface GoldCsvRow {
  gold_case_id?: string;
  source_ticket_id?: string;
  product?: string;
  issue_description?: string;
  priority?: string;
  channel?: string;
  expected_category?: string;
  expected_customer_intent?: string;
  expected_resolution_notes?: string;
  expected_policy_flags?: string;
  expected_risk_level?: string;
  expected_final_action?: string;
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

function parsePolicyFlags(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(";")
    .map((flag) => flag.trim())
    .filter(Boolean);
}

function isRiskLevel(value: string): value is RiskLevel {
  return value === "low" || value === "medium" || value === "high";
}

function isRecommendedAction(value: string): value is RecommendedAction {
  return value === "auto_resolve" || value === "human_review" || value === "escalate";
}

function requireField(row: GoldCsvRow, field: keyof GoldCsvRow, rowNumber: number): string {
  const value = row[field]?.trim();
  if (!value) {
    throw new Error(`Gold dataset row ${rowNumber} is missing ${field}`);
  }
  return value;
}

export function loadGoldCasesFromCsv(csvText: string): GoldCase[] {
  const parsed = Papa.parse<GoldCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Gold dataset CSV parse failed: ${parsed.errors[0].message}`);
  }

  return parsed.data.map((row, index) => {
    const rowNumber = index + 2;
    const id = requireField(row, "gold_case_id", rowNumber);
    const riskLevel = normalizeLabel(requireField(row, "expected_risk_level", rowNumber));
    const finalAction = normalizeLabel(requireField(row, "expected_final_action", rowNumber));

    if (!isRiskLevel(riskLevel)) {
      throw new Error(`Gold dataset row ${rowNumber} has invalid expected_risk_level`);
    }

    if (!isRecommendedAction(finalAction)) {
      throw new Error(`Gold dataset row ${rowNumber} has invalid expected_final_action`);
    }

    return {
      id,
      sourceTicketId: requireField(row, "source_ticket_id", rowNumber),
      ticket: {
        id,
        description: requireField(row, "issue_description", rowNumber),
        subject: null,
        product: row.product?.trim() || null,
        priority: row.priority?.trim() || null,
        channel: row.channel?.trim() || null,
      },
      expected: {
        category: requireField(row, "expected_category", rowNumber),
        customerIntent: requireField(row, "expected_customer_intent", rowNumber),
        resolutionNotes: requireField(row, "expected_resolution_notes", rowNumber),
        policyFlags: parsePolicyFlags(row.expected_policy_flags),
        riskLevel,
        finalAction,
      },
    };
  });
}


export const GOLD_SCORE_DIMENSIONS = 3;

function scoreDimensionFailures(matches: GoldCaseScore["matches"]): string[] {
  return Object.entries(matches)
    .filter(([, matched]) => !matched)
    .map(([key]) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`));
}

export function scoreGoldCase(goldCase: GoldCase, actual: ActualGoldResult): GoldCaseScore {
  const matches = {
    category: normalizeLabel(actual.analysis.issueCategory) === normalizeLabel(goldCase.expected.category),
    customerIntent:
      normalizeLabel(actual.analysis.customerIntent) === normalizeLabel(goldCase.expected.customerIntent),
    finalAction: actual.finalAction === goldCase.expected.finalAction,
  };
  const pointsEarned = Number(matches.category) + Number(matches.customerIntent) + Number(matches.finalAction);

  return {
    caseId: goldCase.id,
    sourceTicketId: goldCase.sourceTicketId,
    passed: pointsEarned === GOLD_SCORE_DIMENSIONS,
    pointsEarned,
    pointsPossible: GOLD_SCORE_DIMENSIONS,
    failures: scoreDimensionFailures(matches),
    matches,
    expected: {
      category: goldCase.expected.category,
      customerIntent: goldCase.expected.customerIntent,
      finalAction: goldCase.expected.finalAction,
    },
    actual: {
      category: actual.analysis.issueCategory,
      customerIntent: actual.analysis.customerIntent,
      finalAction: actual.finalAction,
      confidence: actual.analysis.confidence,
      guardrailReasons: actual.guardrailReasons,
    },
  };
}

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function summarizeGoldEvaluation(scores: GoldCaseScore[]): GoldEvaluationSummary {
  const totalCases = scores.length;
  const totalPoints = totalCases * GOLD_SCORE_DIMENSIONS;
  const categoryPoints = scores.filter((score) => score.matches.category).length;
  const intentPoints = scores.filter((score) => score.matches.customerIntent).length;
  const actionPoints = scores.filter((score) => score.matches.finalAction).length;
  const matchedPoints = scores.reduce((sum, score) => sum + score.pointsEarned, 0);

  return {
    totalCases,
    totalPoints,
    matchedPoints,
    scorePercent: percent(matchedPoints, totalPoints),
    categoryPoints,
    intentPoints,
    actionPoints,
    passedCases: scores.filter((score) => score.passed).length,
    categoryAccuracy: percent(categoryPoints, totalCases),
    customerIntentAccuracy: percent(intentPoints, totalCases),
    finalActionAccuracy: percent(actionPoints, totalCases),
  };
}

interface RunGoldEvaluationOptions {
  cases: GoldCase[];
  policies: string[];
  confidenceThreshold: number;
  concurrency?: number;
  analyzeTicket(ticket: GoldCase["ticket"], policies: string[]): Promise<AiAnalysisResult>;
  applyDecision(
    analysis: AiAnalysisResult,
    options: { confidenceThreshold: number },
  ): GuardrailDecision;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}

export async function runGoldEvaluation(options: RunGoldEvaluationOptions): Promise<GoldEvaluationReport> {
  const concurrency = Math.max(1, options.concurrency ?? 1);

  const results = await mapWithConcurrency(options.cases, concurrency, async (goldCase) => {
    const analysis = await options.analyzeTicket(goldCase.ticket, options.policies);
    const decision = options.applyDecision(analysis, {
      confidenceThreshold: options.confidenceThreshold,
    });
    const actual = {
      analysis,
      finalAction: decision.finalAction,
      guardrailReasons: decision.reasons,
    };

    return {
      case: goldCase,
      actual,
      score: scoreGoldCase(goldCase, actual),
    };
  });

  return {
    summary: summarizeGoldEvaluation(results.map((result) => result.score)),
    results,
  };
}

interface BuildGoldEvaluationMarkdownOptions {
  report: GoldEvaluationReport;
  model: string;
  promptVersion: string;
  datasetPath: string;
  generatedAt?: Date;
}

export function buildGoldEvaluationMarkdown(options: BuildGoldEvaluationMarkdownOptions): string {
  const { summary } = options.report;
  const failingResults = options.report.results.filter((result) => !result.score.passed).slice(0, 10);

  return [
    "# Gold Evaluation Report",
    "",
    "## Run Metadata",
    "",
    `- Generated at: ${(options.generatedAt ?? new Date()).toISOString()}`,
    `- Model: ${options.model}`,
    `- Prompt version: ${options.promptVersion}`,
    `- Dataset: ${options.datasetPath}`,
    "",
    "## Summary",
    "",
    `- Total cases: ${summary.totalCases}`,
    `- Score: ${summary.matchedPoints}/${summary.totalPoints} (${summary.scorePercent}%)`,
    `- Passed cases (3/3 each): ${summary.passedCases}`,
    `- Category points: ${summary.categoryPoints}/${summary.totalCases}`,
    `- Intent points: ${summary.intentPoints}/${summary.totalCases}`,
    `- Action points: ${summary.actionPoints}/${summary.totalCases}`,
    "",
    "## Failure Examples",
    "",
    ...(failingResults.length === 0
      ? ["- No failures found."]
      : failingResults.flatMap((result) => [
          `- ${result.case.id}: ${result.score.failures.join(", ")}`,
          `  - Ticket: ${result.case.ticket.description}`,
          `  - Expected: ${result.score.expected.finalAction}, ${result.score.expected.category}, ${result.score.expected.customerIntent}`,
          `  - Actual: ${result.score.actual.finalAction}, ${result.score.actual.category}, ${result.score.actual.customerIntent}`,
        ])),
    "",
  ].join("\n");
}
