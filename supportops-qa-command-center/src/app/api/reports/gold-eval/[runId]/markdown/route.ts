import { NextResponse } from "next/server";
import { buildLatestGoldReportMarkdown } from "@/lib/evaluation/markdown";
import {
  loadGoldEvalRunById,
  loadLatestGoldReport,
} from "@/lib/evaluation/report-store";

interface RouteContext {
  params: Promise<{ runId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { runId } = await context.params;
  const report =
    runId === "latest"
      ? await loadLatestGoldReport()
      : await loadGoldEvalRunById(runId);

  if (!report) {
    return NextResponse.json({ error: "Gold evaluation run not found." }, { status: 404 });
  }

  const markdown = buildLatestGoldReportMarkdown(report);
  const filename = `gold-eval-${runId === "latest" ? "latest" : runId}.md`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
