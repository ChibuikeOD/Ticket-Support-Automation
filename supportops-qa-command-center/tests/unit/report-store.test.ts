import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyGuardrails } from "@/lib/automation/guardrails";
import { loadGoldCasesFromCsv, runGoldEvaluation } from "@/lib/evaluation/gold";
import {
  buildLatestGoldReport,
  loadLatestGoldReport,
  mapGoldResultToCaseResult,
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
  });
});
