import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyGuardrails } from "@/lib/automation/guardrails";
import { loadGoldCasesFromCsv, runGoldEvaluation } from "@/lib/evaluation/gold";
import {
  buildLatestGoldReport,
  listGoldEvalRuns,
  loadGoldEvalRunById,
  loadLatestGoldReport,
  mapGoldResultToCaseResult,
  normalizeGoldEvaluationSummary,
  saveLatestGoldReport,
} from "@/lib/evaluation/report-store";

const goldCsv = [
  "gold_case_id,source_ticket_id,product,issue_description,priority,channel,expected_category,expected_customer_intent,expected_resolution_notes,expected_policy_flags,expected_risk_level,expected_final_action",
  "GOLD-00001,384,Payment Gateway,The payment was deducted from my bank account but the transaction shows failed.,High,Web Form,Payment Problem,Resolve failed transaction after payment deduction,Payment gateway timeout issue fixed and monitoring implemented.,payment_issue;financial_sensitive;human_review_required,medium,human_review",
].join("\n");

describe("evaluation report store", () => {
  it("maps gold results into UI case payloads with ticket text and comparisons", async () => {
    const [goldCase] = loadGoldCasesFromCsv(goldCsv);
    const report = await runGoldEvaluation({
      cases: [goldCase],
      policies: ["Financial-sensitive tickets require human review."],
      confidenceThreshold: 0.82,
      analyzeTicket: async () => ({
        issueCategory: "Payment Problem",
        customerIntent: "Resolve failed transaction after payment deduction",
        summary: "Customer paid but the transaction still shows failed.",
        sentiment: "frustrated",
        riskLevel: "medium",
        draftResponse: "I can help route this payment issue for review.",
        confidence: 0.91,
        recommendedAction: "human_review",
        escalationReason: "",
        policyChecks: [],
      }),
      applyDecision: applyGuardrails,
    });

    const mapped = mapGoldResultToCaseResult(report.results[0]);

    expect(mapped.ticket.description).toContain("payment was deducted");
    expect(mapped.expected.category).toBe("Payment Problem");
    expect(mapped.actual.finalAction).toBe("human_review");
    expect(mapped.pointsPossible).toBe(3);
  });

  it("builds a persisted latest report with all case results", async () => {
    const [goldCase] = loadGoldCasesFromCsv(goldCsv);
    const report = await runGoldEvaluation({
      cases: [goldCase],
      policies: [],
      confidenceThreshold: 0.82,
      analyzeTicket: async () => ({
        issueCategory: "Payment Problem",
        customerIntent: "Resolve failed transaction after payment deduction",
        summary: "Customer paid but the transaction still shows failed.",
        sentiment: "frustrated",
        riskLevel: "medium",
        draftResponse: "Thanks for reaching out.",
        confidence: 0.91,
        recommendedAction: "human_review",
        escalationReason: "",
        policyChecks: [],
      }),
      applyDecision: applyGuardrails,
    });

    const latest = buildLatestGoldReport({
      generatedAt: new Date("2026-06-23T12:00:00.000Z"),
      model: "deepseek-chat",
      promptVersion: "ui",
      datasetPath: "gold.csv",
      batchSize: 1,
      source: "ui",
      report,
    });

    expect(latest.cases).toHaveLength(1);
    expect(latest.source).toBe("ui");
    expect(latest.summary.totalPoints).toBe(3);
  });

  it("round-trips the latest report through the filesystem", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "gold-report-store-"));
    const reportsDir = path.join(dir, "evaluation-reports");
    const [goldCase] = loadGoldCasesFromCsv(goldCsv);
    const report = await runGoldEvaluation({
      cases: [goldCase],
      policies: [],
      confidenceThreshold: 0.82,
      analyzeTicket: async () => ({
        issueCategory: "Payment Problem",
        customerIntent: "Resolve failed transaction after payment deduction",
        summary: "Customer paid but the transaction still shows failed.",
        sentiment: "frustrated",
        riskLevel: "medium",
        draftResponse: "Thanks for reaching out.",
        confidence: 0.91,
        recommendedAction: "human_review",
        escalationReason: "",
        policyChecks: [],
      }),
      applyDecision: applyGuardrails,
    });

    const latest = buildLatestGoldReport({
      generatedAt: new Date("2026-06-23T12:00:00.000Z"),
      model: "deepseek-chat",
      promptVersion: "ui",
      datasetPath: "gold.csv",
      batchSize: 1,
      source: "ui",
      report,
    });

    await saveLatestGoldReport(latest, reportsDir);

    const loaded = await loadLatestGoldReport(reportsDir);

    expect(loaded?.model).toBe("deepseek-chat");
    expect(loaded?.cases).toHaveLength(1);
    expect(loaded?.runId).toBeTruthy();
  });

  it("archives each saved run and loads it by id", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "gold-report-history-"));
    const reportsDir = path.join(dir, "evaluation-reports");
    const [goldCase] = loadGoldCasesFromCsv(goldCsv);
    const report = await runGoldEvaluation({
      cases: [goldCase],
      policies: [],
      confidenceThreshold: 0.82,
      analyzeTicket: async () => ({
        issueCategory: "Payment Problem",
        customerIntent: "Resolve failed transaction after payment deduction",
        summary: "Customer paid but the transaction still shows failed.",
        sentiment: "frustrated",
        riskLevel: "medium",
        draftResponse: "Thanks for reaching out.",
        confidence: 0.91,
        recommendedAction: "human_review",
        escalationReason: "",
        policyChecks: [],
      }),
      applyDecision: applyGuardrails,
    });

    const latest = buildLatestGoldReport({
      generatedAt: new Date("2026-06-23T12:00:00.000Z"),
      model: "deepseek-chat",
      promptVersion: "ui",
      datasetPath: "gold.csv",
      batchSize: 1,
      source: "ui",
      report,
    });

    const runId = await saveLatestGoldReport(latest, reportsDir);
    const runs = await listGoldEvalRuns({ reportsDir });
    const loaded = await loadGoldEvalRunById(runId, reportsDir);

    expect(runs).toHaveLength(1);
    expect(runs[0]?.runId).toBe(runId);
    expect(loaded?.summary.totalPoints).toBe(3);
  });

  it("fills missing point-based summary fields from persisted case results", () => {
    const summary = normalizeGoldEvaluationSummary(
      {
        totalCases: 1,
        passedCases: 0,
        categoryAccuracy: 100,
        customerIntentAccuracy: 0,
        finalActionAccuracy: 0,
      },
      [
        {
          caseId: "GOLD-1",
          passed: false,
          pointsEarned: 1,
          pointsPossible: 3,
          failures: ["customer intent"],
          matches: { category: true, customerIntent: false, finalAction: false },
          ticket: {
            description: "Login fails",
            product: "Portal",
            priority: "High",
            channel: "Email",
          },
          expected: {
            category: "Account Access",
            customerIntent: "Log in",
            finalAction: "escalate",
          },
          actual: {
            category: "Account Access",
            customerIntent: "Reset password",
            finalAction: "human_review",
            confidence: 0.9,
            guardrailReasons: [],
          },
        },
      ],
    );

    expect(summary.matchedPoints).toBe(1);
    expect(summary.totalPoints).toBe(3);
    expect(summary.scorePercent).toBe(33);
    expect(summary.categoryPoints).toBe(1);
    expect(summary.intentPoints).toBe(0);
    expect(summary.actionPoints).toBe(0);
  });
});
