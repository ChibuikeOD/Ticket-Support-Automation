import { NextResponse } from "next/server";
import { applyGuardrails } from "@/lib/automation/guardrails";
import { readDatasetTicketsAsync, selectRandomOpenTicket } from "@/lib/dataset/tickets";
import { prisma } from "@/lib/db";
import { analyzeTicketWithDeepSeek } from "@/lib/llm/deepseek";

export async function POST() {
  try {
    const dataset = await readDatasetTicketsAsync();
    const ticket = selectRandomOpenTicket(dataset.tickets);

    if (!ticket) {
      return NextResponse.json({ error: "No open tickets were found in the 200k sample dataset." }, { status: 409 });
    }

    const policies = await prisma.policyRule.findMany({
      where: { enabled: true },
      select: { ruleText: true },
    });
    const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    const analysis = await analyzeTicketWithDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
      model,
      ticket: {
        id: ticket.externalId,
        description: ticket.data.ticketDescription,
        subject: ticket.data.ticketSubject,
        product: ticket.data.productPurchased,
        priority: ticket.data.priority,
        channel: ticket.data.channel,
      },
      policies: policies.map((policy) => policy.ruleText),
    });
    const decision = applyGuardrails(analysis, {
      confidenceThreshold: Number(process.env.AUTOMATION_CONFIDENCE_THRESHOLD ?? "0.82"),
    });

    return NextResponse.json({
      datasetPath: dataset.csvPath,
      ticket: {
        externalId: ticket.externalId,
        subject: ticket.data.ticketSubject,
        description: ticket.data.ticketDescription,
        product: ticket.data.productPurchased,
        priority: ticket.data.priority,
        channel: ticket.data.channel,
        status: ticket.data.ticketStatus,
      },
      analysis,
      decision,
      model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sample run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
