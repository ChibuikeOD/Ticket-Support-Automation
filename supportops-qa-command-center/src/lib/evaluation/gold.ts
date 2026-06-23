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
  unsafeAutoResolve: boolean;
  failures: string[];
  matches: {
    category: boolean;
    customerIntent: boolean;
    riskLevel: boolean;
    finalAction: boolean;
    policyFlags: boolean;
  };
  expected: GoldCase["expected"];
  actual: {
    category: string;
    customerIntent: string;
    riskLevel: RiskLevel;
    finalAction: RecommendedAction;
    policyFlags: string[];
    confidence: number;
    guardrailReasons: string[];
  };
}

export interface GoldEvaluationSummary {
  totalCases: number;
  passedCases: number;
  categoryAccuracy: number;
  customerIntentAccuracy: number;
  riskAccuracy: number;
  finalActionAccuracy: number;
  policyFlagAccuracy: number;
  escalationRecall: number;
  unsafeAutoResolveRate: number;
  unsafeAutoResolveCount: number;
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

function policyFlagsFromAnalysis(analysis: AiAnalysisResult): string[] {
  return analysis.policyChecks.flatMap((check) => {
    const text = `${check.policy} ${check.reason}`.toLowerCase();
    const flags: string[] = [];

    if (text.includes("payment")) flags.push("payment_issue");
    if (text.includes("billing")) flags.push("billing_issue");
    if (text.includes("refund")) flags.push("refund_request");
    if (text.includes("financial")) flags.push("financial_sensitive");
    if (text.includes("security")) flags.push("security_sensitive");
    if (text.includes("authentication") || text.includes("two-factor")) flags.push("authentication");
    if (text.includes("human review")) flags.push("human_review_required");
    if (text.includes("escalation")) flags.push("escalation_required");
    if (text.includes("bug")) flags.push("bug_report");
    if (text.includes("troubleshooting")) flags.push("technical_troubleshooting");
    if (text.includes("account access") || text.includes("credential")) flags.push("account_access");
    if (text.includes("subscription")) flags.push("subscription_change");

    return flags;
  });
}

function includesExpectedFlags(actualFlags: string[], expectedFlags: string[]): boolean {
  if (expectedFlags.length === 0) return true;
  const actual = new Set(actualFlags);
  return expectedFlags.every((flag) => actual.has(flag));
}

export function scoreGoldCase(goldCase: GoldCase, actual: ActualGoldResult): GoldCaseScore {
  const actualPolicyFlags = Array.from(new Set(policyFlagsFromAnalysis(actual.analysis)));
  const matches = {
    category: normalizeLabel(actual.analysis.issueCategory) === normalizeLabel(goldCase.expected.category),
    customerIntent:
      normalizeLabel(actual.analysis.customerIntent) === normalizeLabel(goldCase.expected.customerIntent),
    riskLevel: actual.analysis.riskLevel === goldCase.expected.riskLevel,
    finalAction: actual.finalAction === goldCase.expected.finalAction,
    policyFlags: includesExpectedFlags(actualPolicyFlags, goldCase.expected.policyFlags),
  };
  const failures = Object.entries(matches)
    .filter(([, matched]) => !matched)
    .map(([key]) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`));
  const unsafeAutoResolve =
    actual.finalAction === "auto_resolve" && goldCase.expected.finalAction !== "auto_resolve";

  return {
    caseId: goldCase.id,
    sourceTicketId: goldCase.sourceTicketId,
    passed: failures.length === 0 && !unsafeAutoResolve,
    unsafeAutoResolve,
    failures,
    matches,
    expected: goldCase.expected,
    actual: {
      category: actual.analysis.issueCategory,
      customerIntent: actual.analysis.customerIntent,
      riskLevel: actual.analysis.riskLevel,
      finalAction: actual.finalAction,
      policyFlags: actualPolicyFlags,
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
  const expectedEscalations = scores.filter((score) => score.expected.finalAction === "escalate");
  const foundEscalations = expectedEscalations.filter((score) => score.actual.finalAction === "escalate");
  const unsafeAutoResolveCount = scores.filter((score) => score.unsafeAutoResolve).length;

  return {
    totalCases,
    passedCases: scores.filter((score) => score.passed).length,
    categoryAccuracy: percent(scores.filter((score) => score.matches.category).length, totalCases),
    customerIntentAccuracy: percent(
      scores.filter((score) => score.matches.customerIntent).length,
      totalCases,
    ),
    riskAccuracy: percent(scores.filter((score) => score.matches.riskLevel).length, totalCases),
    finalActionAccuracy: percent(scores.filter((score) => score.matches.finalAction).length, totalCases),
    policyFlagAccuracy: percent(scores.filter((score) => score.matches.policyFlags).length, totalCases),
    escalationRecall: percent(foundEscalations.length, expectedEscalations.length),
    unsafeAutoResolveRate: percent(unsafeAutoResolveCount, totalCases),
    unsafeAutoResolveCount,
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
    `- Passed cases: ${summary.passedCases}`,
    `- Category accuracy: ${summary.categoryAccuracy}%`,
    `- Customer-intent accuracy: ${summary.customerIntentAccuracy}%`,
    `- Risk accuracy: ${summary.riskAccuracy}%`,
    `- Final-action accuracy: ${summary.finalActionAccuracy}%`,
    `- Policy-flag accuracy: ${summary.policyFlagAccuracy}%`,
    `- Escalation recall: ${summary.escalationRecall}%`,
    `- Unsafe auto-resolve rate: ${summary.unsafeAutoResolveRate}%`,
    `- Unsafe auto-resolve count: ${summary.unsafeAutoResolveCount}`,
    "",
    "## Failure Examples",
    "",
    ...(failingResults.length === 0
      ? ["- No failures found."]
      : failingResults.flatMap((result) => [
          `- ${result.case.id}: ${result.score.failures.join(", ")}`,
          `  - Ticket: ${result.case.ticket.description}`,
          `  - Expected: ${result.score.expected.finalAction}, ${result.score.expected.riskLevel}, ${result.score.expected.category}`,
          `  - Actual: ${result.score.actual.finalAction}, ${result.score.actual.riskLevel}, ${result.score.actual.category}`,
        ])),
    "",
  ].join("\n");
}
