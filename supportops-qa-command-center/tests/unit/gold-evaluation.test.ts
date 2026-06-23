import { describe, expect, it } from "vitest";
import { applyGuardrails } from "@/lib/automation/guardrails";
import {
  loadGoldCasesFromCsv,
  scoreGoldCase,
  summarizeGoldEvaluation,
  runGoldEvaluation,
  buildGoldEvaluationMarkdown,
} from "@/lib/evaluation/gold";
import type { AiAnalysisResult } from "@/lib/types";

const goldCsv = [
  "gold_case_id,source_ticket_id,product,issue_description,priority,channel,expected_category,expected_customer_intent,expected_resolution_notes,expected_policy_flags,expected_risk_level,expected_final_action",
  "GOLD-00001,384,Payment Gateway,The payment was deducted from my bank account but the transaction shows failed.,High,Web Form,Payment Problem,Resolve failed transaction after payment deduction,Payment gateway timeout issue fixed and monitoring implemented.,payment_issue;financial_sensitive;human_review_required,medium,human_review",
  "GOLD-00002,3285,Web Portal,Two-factor authentication codes are not being delivered to my phone.,High,Email,Security Concern,Receive two-factor authentication code,Security settings updated and customer notified of precautionary measures.,authentication;security_sensitive;escalation_required,high,escalate",
].join("\n");

const paymentAnalysis: AiAnalysisResult = {
  issueCategory: "Payment Problem",
  customerIntent: "Resolve failed transaction after payment deduction",
  summary: "Customer paid but the transaction still shows failed.",
  sentiment: "frustrated",
  riskLevel: "medium",
  draftResponse: "I can help route this payment issue for review.",
  confidence: 0.91,
  recommendedAction: "human_review",
  escalationReason: "",
  policyChecks: [
    {
      policy: "Financial-sensitive tickets require human review.",
      status: "needs_review",
      reason: "Payment status requires account review.",
    },
  ],
};

describe("gold evaluation", () => {
  it("loads gold cases from the cleaned CSV schema", () => {
    const cases = loadGoldCasesFromCsv(goldCsv);

    expect(cases).toHaveLength(2);
    expect(cases[0]).toMatchObject({
      id: "GOLD-00001",
      ticket: {
        id: "GOLD-00001",
        description: "The payment was deducted from my bank account but the transaction shows failed.",
        product: "Payment Gateway",
        priority: "High",
        channel: "Web Form",
      },
      expected: {
        category: "Payment Problem",
        riskLevel: "medium",
        finalAction: "human_review",
        policyFlags: ["payment_issue", "financial_sensitive", "human_review_required"],
      },
    });
  });

  it("scores exact label matches and flags unsafe auto-resolve failures", () => {
    const [goldCase] = loadGoldCasesFromCsv(goldCsv);
    const actual = {
      analysis: paymentAnalysis,
      finalAction: "auto_resolve" as const,
      guardrailReasons: ["AI recommendation is eligible for auto-resolution."],
    };

    const score = scoreGoldCase(goldCase, actual);

    expect(score.matches.category).toBe(true);
    expect(score.matches.riskLevel).toBe(true);
    expect(score.matches.finalAction).toBe(false);
    expect(score.unsafeAutoResolve).toBe(true);
    expect(score.failures).toContain("final_action");
  });

  it("summarizes accuracy, escalation recall, and unsafe auto-resolve rate", () => {
    const cases = loadGoldCasesFromCsv(goldCsv);
    const scores = [
      scoreGoldCase(cases[0], {
        analysis: paymentAnalysis,
        finalAction: "human_review",
        guardrailReasons: ["Financial issue requires review."],
      }),
      scoreGoldCase(cases[1], {
        analysis: {
          ...paymentAnalysis,
          issueCategory: "Security Concern",
          customerIntent: "Receive two-factor authentication code",
          riskLevel: "medium",
          recommendedAction: "human_review",
        },
        finalAction: "human_review",
        guardrailReasons: ["Account access requires review."],
      }),
    ];

    const summary = summarizeGoldEvaluation(scores);

    expect(summary.totalCases).toBe(2);
    expect(summary.categoryAccuracy).toBe(100);
    expect(summary.riskAccuracy).toBe(50);
    expect(summary.finalActionAccuracy).toBe(50);
    expect(summary.escalationRecall).toBe(0);
    expect(summary.unsafeAutoResolveRate).toBe(0);
  });

  it("runs gold cases through an analyzer and applies guardrails before scoring", async () => {
    const [goldCase] = loadGoldCasesFromCsv(goldCsv);

    const report = await runGoldEvaluation({
      cases: [goldCase],
      policies: ["Financial-sensitive tickets require human review."],
      confidenceThreshold: 0.82,
      analyzeTicket: async () => paymentAnalysis,
      applyDecision: applyGuardrails,
    });

    expect(report.summary.finalActionAccuracy).toBe(100);
    expect(report.results[0].score.passed).toBe(true);
  });

  it("builds a markdown report with summary metrics and failure examples", async () => {
    const cases = loadGoldCasesFromCsv(goldCsv);
    const report = await runGoldEvaluation({
      cases,
      policies: ["Financial-sensitive tickets require human review."],
      confidenceThreshold: 0.82,
      analyzeTicket: async (ticket) =>
        ticket.id === "GOLD-00001"
          ? paymentAnalysis
          : {
              ...paymentAnalysis,
              issueCategory: "Security Concern",
              customerIntent: "Receive two-factor authentication code",
              riskLevel: "medium",
              recommendedAction: "human_review",
            },
      applyDecision: applyGuardrails,
    });

    const markdown = buildGoldEvaluationMarkdown({
      report,
      model: "test-model",
      promptVersion: "v-test",
      datasetPath: "gold.csv",
    });

    expect(markdown).toContain("# Gold Evaluation Report");
    expect(markdown).toContain("- Model: test-model");
    expect(markdown).toContain("- Final-action accuracy: 100%");
    expect(markdown).toContain("- Risk accuracy: 50%");
    expect(markdown).toContain("GOLD-00002");
    expect(markdown).toContain("risk_level");
  });
});
