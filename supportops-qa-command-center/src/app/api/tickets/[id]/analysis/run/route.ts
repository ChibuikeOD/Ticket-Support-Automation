import { NextResponse } from "next/server";
import { runTicketAutomation } from "@/lib/automation/runner";
import { analyzeTicketWithDeepSeek } from "@/lib/llm/deepseek";
import { prisma } from "@/lib/db";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    const result = await runTicketAutomation({
      db: prisma,
      ticketIds: [id],
      promptVersion: "v1",
      model,
      confidenceThreshold: Number(process.env.AUTOMATION_CONFIDENCE_THRESHOLD ?? "0.82"),
      analyzeTicket: (ticket, policies) =>
        analyzeTicketWithDeepSeek({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
          model,
          ticket,
          policies,
        }),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
