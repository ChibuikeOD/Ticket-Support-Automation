import { describe, expect, it, vi } from "vitest";
import { analyzeTicketWithDeepSeek } from "@/lib/llm/deepseek";

describe("analyzeTicketWithDeepSeek", () => {
  it("throws a setup error when the API key is missing", async () => {
    await expect(
      analyzeTicketWithDeepSeek({
        apiKey: "",
        baseUrl: "https://api.deepseek.com",
        model: "deepseek-chat",
        ticket: {
          id: "ticket-1",
          description: "Where is my shipment?",
          subject: "Shipping delay",
          product: "Wireless Headphones",
          priority: "Medium",
          channel: "Email",
        },
        policies: ["Shipping status can be automated when no refund is requested."],
      }),
    ).rejects.toThrow("DeepSeek API key is missing");
  });

  it("parses valid DeepSeek JSON responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                issueCategory: "Shipping",
                customerIntent: "Check delivery status",
                summary: "Customer asks for shipment status.",
                sentiment: "neutral",
                riskLevel: "low",
                draftResponse: "Thanks for reaching out. I can help check the shipment status.",
                confidence: 0.9,
                recommendedAction: "auto_resolve",
                escalationReason: "",
                policyChecks: [
                  {
                    policy: "Shipping status can be automated when no refund is requested.",
                    status: "pass",
                    reason: "No refund requested.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await analyzeTicketWithDeepSeek({
      apiKey: "test-key",
      baseUrl: "https://api.deepseek.com",
      model: "deepseek-chat",
      ticket: {
        id: "ticket-1",
        description: "Where is my shipment?",
        subject: "Shipping delay",
        product: "Wireless Headphones",
        priority: "Medium",
        channel: "Email",
      },
      policies: ["Shipping status can be automated when no refund is requested."],
    });

    expect(result.issueCategory).toBe("Shipping");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
