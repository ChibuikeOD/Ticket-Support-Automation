import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") ?? "latest";

  const analyses =
    scope === "all"
      ? await prisma.aiAnalysis.findMany({
          where: { ticketId: id },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        })
      : await prisma.aiAnalysis.findMany({
          where: { ticketId: id },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true },
        });
  const analysisIds = analyses.map((analysis) => analysis.id);

  if (analysisIds.length === 0) {
    return NextResponse.json({ deletedCount: 0 });
  }

  await prisma.reviewDecision.deleteMany({
    where: { aiAnalysisId: { in: analysisIds } },
  });
  const deleted = await prisma.aiAnalysis.deleteMany({
    where: { id: { in: analysisIds } },
  });
  const remaining = await prisma.aiAnalysis.count({
    where: { ticketId: id },
  });

  if (remaining === 0) {
    await prisma.ticket.update({
      where: { id },
      data: { status: "seeded" },
    });
  }

  return NextResponse.json({ deletedCount: deleted.count, remainingAnalyses: remaining });
}
