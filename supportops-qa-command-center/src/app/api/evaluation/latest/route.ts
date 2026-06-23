import { NextResponse } from "next/server";
import { loadLatestGoldReport } from "@/lib/evaluation/report-store";

export async function GET() {
  const latest = await loadLatestGoldReport();

  if (!latest) {
    return NextResponse.json({ error: "No evaluation run found." }, { status: 404 });
  }

  return NextResponse.json({
    generatedAt: latest.generatedAt,
    model: latest.model,
    batchSize: latest.batchSize,
    datasetCaseCount: undefined,
    evaluatedCaseCount: latest.summary.totalCases,
    summary: latest.summary,
    cases: latest.cases,
  });
}
