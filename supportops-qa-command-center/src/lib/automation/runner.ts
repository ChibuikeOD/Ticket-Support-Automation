import type { AiAnalysisResult } from "@/lib/types";
import { applyGuardrails } from "@/lib/automation/guardrails";

type MinimalDb = {
  automationRun: {
    create(args: unknown): Promise<{ id: string }>;
    update(args: unknown): Promise<unknown>;
  };
  ticket: {
    findMany(args: unknown): Promise<
      Array<{
        id: string;
        ticketDescription: string;
        ticketSubject: string | null;
        productPurchased: string | null;
        priority: string | null;
        channel: string | null;
      }>
    >;
    update(args: unknown): Promise<unknown>;
  };
  policyRule: {
    findMany(args: unknown): Promise<Array<{ ruleText: string }>>;
  };
  aiAnalysis: {
    create(args: unknown): Promise<unknown>;
  };
};

interface RunTicketAutomationOptions {
  db: MinimalDb;
  ticketIds: string[];
  promptVersion: string;
  model: string;
  analyzeTicket(
    ticket: {
      id: string;
      description: string;
      subject: string | null;
      product: string | null;
      priority: string | null;
      channel: string | null;
    },
    policies: string[],
  ): Promise<AiAnalysisResult>;
  confidenceThreshold: number;
}

export async function runTicketAutomation(options: RunTicketAutomationOptions) {
  if (options.ticketIds.length === 0) {
    throw new Error("No tickets selected for automation");
  }

  const run = await options.db.automationRun.create({
    data: {
      name: `Run ${new Date().toISOString()}`,
      model: options.model,
      promptVersion: options.promptVersion,
      status: "running",
    },
  });

  const [tickets, policies] = await Promise.all([
    options.db.ticket.findMany({
      where: { id: { in: options.ticketIds } },
    }),
    options.db.policyRule.findMany({
      where: { enabled: true },
    }),
  ]);

  const policyTexts = policies.map((policy) => policy.ruleText);

  for (const ticket of tickets) {
    await options.db.ticket.update({
      where: { id: ticket.id },
      data: { status: "processing" },
    });

    try {
      const analysis = await options.analyzeTicket(
        {
          id: ticket.id,
          description: ticket.ticketDescription,
          subject: ticket.ticketSubject,
          product: ticket.productPurchased,
          priority: ticket.priority,
          channel: ticket.channel,
        },
        policyTexts,
      );
      const decision = applyGuardrails(analysis, {
        confidenceThreshold: options.confidenceThreshold,
      });

      await options.db.aiAnalysis.create({
        data: {
          ticketId: ticket.id,
          automationRunId: run.id,
          issueCategory: analysis.issueCategory,
          customerIntent: analysis.customerIntent,
          summary: analysis.summary,
          sentiment: analysis.sentiment,
          riskLevel: analysis.riskLevel,
          draftResponse: analysis.draftResponse,
          confidence: analysis.confidence,
          recommendedAction: analysis.recommendedAction,
          finalAction: decision.finalAction,
          escalationReason: analysis.escalationReason,
          policyChecksJson: JSON.stringify(analysis.policyChecks),
          guardrailReasonsJson: JSON.stringify(decision.reasons),
          rawModelJson: JSON.stringify(analysis),
        },
      });

      await options.db.ticket.update({
        where: { id: ticket.id },
        data: {
          status: decision.finalAction === "auto_resolve" ? "auto_resolved" : decision.finalAction,
        },
      });
    } catch {
      await options.db.ticket.update({
        where: { id: ticket.id },
        data: { status: "human_review" },
      });
    }
  }

  await options.db.automationRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      processedCount: tickets.length,
    },
  });

  return { runId: run.id, processedCount: tickets.length };
}
