import { describe, expect, it, vi } from "vitest";
import { runTicketAutomation } from "@/lib/automation/runner";
import { lowRiskAnalysis } from "@/test/fixtures";

describe("runTicketAutomation", () => {
  it("stores analysis and final guardrail decision for a ticket", async () => {
    const db = {
      automationRun: {
        create: vi.fn().mockResolvedValue({ id: "run-1" }),
        update: vi.fn().mockResolvedValue({ id: "run-1" }),
      },
      ticket: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "ticket-1",
            ticketDescription: "Where is my package?",
            ticketSubject: "Shipping delay",
            productPurchased: "Wireless Headphones",
            priority: "Medium",
            channel: "Email",
          },
        ]),
        update: vi.fn().mockResolvedValue({ id: "ticket-1" }),
      },
      policyRule: {
        findMany: vi.fn().mockResolvedValue([
          { ruleText: "Shipping status can be automated when no refund is requested." },
        ]),
      },
      aiAnalysis: {
        create: vi.fn().mockResolvedValue({ id: "analysis-1" }),
      },
    };

    const result = await runTicketAutomation({
      db,
      ticketIds: ["ticket-1"],
      promptVersion: "v1",
      model: "deepseek-chat",
      analyzeTicket: vi.fn().mockResolvedValue(lowRiskAnalysis),
      confidenceThreshold: 0.82,
    });

    expect(result.processedCount).toBe(1);
    expect(db.ticket.update).toHaveBeenCalledWith({
      where: { id: "ticket-1" },
      data: { status: "auto_resolved" },
    });
  });
});
