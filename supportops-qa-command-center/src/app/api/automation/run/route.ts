import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runTicketAutomation } from "@/lib/automation/runner";
import { analyzeTicketWithDeepSeek } from "@/lib/llm/deepseek";

export async function POST(request: Request) {
  const body = (await request.json()) as { ticketIds?: string[]; promptVersion?: string };
  const ticketIds = body.ticketIds ?? [];

  if (ticketIds.length === 0) {
    return NextResponse.json({ error: "Select at least one ticket." }, { status: 400 });
  }

  try {
    const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    const result = await runTicketAutomation({
      db: prisma,
      ticketIds,
      promptVersion: body.promptVersion ?? "v1",
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
    const message = error instanceof Error ? error.message : "Automation run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
