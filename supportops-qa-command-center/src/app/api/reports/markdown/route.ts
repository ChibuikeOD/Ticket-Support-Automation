import { NextResponse } from "next/server";
import { calculateOverviewMetrics } from "@/lib/automation/metrics";
import { buildMarkdownReport } from "@/lib/automation/report";
import { prisma } from "@/lib/db";

export async function GET() {
  const [latestRun, tickets, reviews, analyses] = await Promise.all([
    prisma.automationRun.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.ticket.findMany({ select: { status: true } }),
    prisma.reviewDecision.findMany({ select: { action: true } }),
    prisma.aiAnalysis.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { confidence: true, summary: true, finalAction: true },
    }),
  ]);

  const metrics = calculateOverviewMetrics({ tickets, reviews, analyses });
  const report = buildMarkdownReport({
    runName: latestRun?.name ?? "No runs yet",
    model: latestRun?.model ?? "not run",
    promptVersion: latestRun?.promptVersion ?? "not run",
    metrics,
    examples: analyses.map((analysis) => `${analysis.summary} Final action: ${analysis.finalAction}.`),
  });

  await prisma.reportExport.create({
    data: {
      runId: latestRun?.id,
      format: "markdown",
      content: report,
    },
  });

  return new NextResponse(report, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="supportops-qa-report.md"',
    },
  });
}
