import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export function statusForReviewAction(action: string) {
  if (action === "approve") return "review_approved";
  if (action === "edit_approve") return "review_edited";
  if (action === "reject") return "review_rejected";
  if (action === "escalate") return "escalated";
  throw new Error("Unknown review action");
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    ticketId?: string;
    aiAnalysisId?: string;
    action?: string;
    editedResponse?: string;
    reviewerNotes?: string;
  };

  if (!body.ticketId || !body.aiAnalysisId || !body.action) {
    return NextResponse.json({ error: "ticketId, aiAnalysisId, and action are required." }, { status: 400 });
  }

  const status = statusForReviewAction(body.action);

  const review = await prisma.reviewDecision.create({
    data: {
      ticketId: body.ticketId,
      aiAnalysisId: body.aiAnalysisId,
      action: body.action,
      editedResponse: body.editedResponse,
      reviewerNotes: body.reviewerNotes,
    },
  });

  await prisma.ticket.update({
    where: { id: body.ticketId },
    data: { status },
  });

  return NextResponse.json({ reviewId: review.id, status });
}
