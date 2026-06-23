import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadGoldDashboardSummary } from "@/lib/evaluation/dashboard";

describe("gold dashboard summary", () => {
  it("loads dataset count and latest evaluation metrics", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "gold-dashboard-"));
    const datasetPath = path.join(dir, "gold.csv");
    const reportsDir = path.join(dir, "evaluation-reports");

    await mkdir(reportsDir, { recursive: true });
    await writeFile(
      datasetPath,
      [
        "gold_case_id,source_ticket_id,product,issue_description,priority,channel,expected_category,expected_customer_intent,expected_resolution_notes,expected_policy_flags,expected_risk_level,expected_final_action",
        "GOLD-1,1,Portal,Login fails,High,Email,Account Access,Log in,Reset authentication.,authentication,high,escalate",
        "GOLD-2,2,Store,Refund please,High,Chat,Refund,Get refund,Review refund.,refund_request,medium,human_review",
      ].join("\n"),
    );
    await writeFile(
      path.join(reportsDir, "latest-gold-eval.json"),
      JSON.stringify({
        generatedAt: "2026-06-23T01:38:35.746Z",
        model: "deepseek-chat",
        promptVersion: "v1",
        datasetPath,
        source: "cli",
        cases: [],
        summary: {
          totalCases: 2,
          totalPoints: 6,
          matchedPoints: 5,
          scorePercent: 83,
          categoryPoints: 2,
          intentPoints: 2,
          actionPoints: 1,
          passedCases: 1,
          categoryAccuracy: 100,
          customerIntentAccuracy: 100,
          finalActionAccuracy: 50,
        },
      }),
    );

    const summary = await loadGoldDashboardSummary({
      datasetPath,
      reportsDir,
    });

    expect(summary.dataset.caseCount).toBe(2);
    expect(summary.latestReport?.model).toBe("deepseek-chat");
    expect(summary.latestReport?.summary.matchedPoints).toBe(5);
    expect(summary.latestReport?.summary.totalPoints).toBe(6);
  });

  it("normalizes legacy summaries that only include passed case counts", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "gold-dashboard-legacy-"));
    const datasetPath = path.join(dir, "gold.csv");
    const reportsDir = path.join(dir, "evaluation-reports");

    await mkdir(reportsDir, { recursive: true });
    await writeFile(
      datasetPath,
      [
        "gold_case_id,source_ticket_id,product,issue_description,priority,channel,expected_category,expected_customer_intent,expected_resolution_notes,expected_policy_flags,expected_risk_level,expected_final_action",
        "GOLD-1,1,Portal,Login fails,High,Email,Account Access,Log in,Reset authentication.,authentication,high,escalate",
      ].join("\n"),
    );
    await writeFile(
      path.join(reportsDir, "latest-gold-eval.json"),
      JSON.stringify({
        generatedAt: "2026-06-23T01:38:35.746Z",
        model: "deepseek-chat",
        promptVersion: "v1",
        datasetPath,
        source: "ui",
        summary: {
          totalCases: 1,
          passedCases: 0,
          categoryAccuracy: 100,
          customerIntentAccuracy: 0,
          finalActionAccuracy: 0,
        },
        cases: [
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
      }),
    );

    const summary = await loadGoldDashboardSummary({
      datasetPath,
      reportsDir,
    });

    expect(summary.latestReport?.summary.matchedPoints).toBe(1);
    expect(summary.latestReport?.summary.totalPoints).toBe(3);
    expect(summary.latestReport?.summary.scorePercent).toBe(33);
  });

  it("returns null latest report when no report has been generated", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "gold-dashboard-empty-"));
    const datasetPath = path.join(dir, "gold.csv");
    await writeFile(
      datasetPath,
      [
        "gold_case_id,source_ticket_id,product,issue_description,priority,channel,expected_category,expected_customer_intent,expected_resolution_notes,expected_policy_flags,expected_risk_level,expected_final_action",
        "GOLD-1,1,Portal,Login fails,High,Email,Account Access,Log in,Reset authentication.,authentication,high,escalate",
      ].join("\n"),
    );

    const summary = await loadGoldDashboardSummary({
      datasetPath,
      reportsDir: path.join(dir, "evaluation-reports"),
    });

    expect(summary.dataset.caseCount).toBe(1);
    expect(summary.latestReport).toBeNull();
  });
});
