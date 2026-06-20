interface PromptTicket {
  id: string;
  subject: string | null;
  description: string;
  product: string | null;
  priority: string | null;
  channel: string | null;
}

export function buildSupportAnalysisPrompt(ticket: PromptTicket, policies: string[]): string {
  return [
    "You are an AI support operations assistant.",
    "Analyze the customer support ticket and return only valid JSON.",
    "Do not include Markdown fences.",
    "Be conservative. Recommend human_review or escalate for billing, refunds, account access, privacy, security, outages, angry customers, missing facts, or unsafe actions.",
    "",
    "Required JSON shape:",
    JSON.stringify(
      {
        issueCategory: "Shipping",
        customerIntent: "Check delivery status",
        summary: "One sentence summary.",
        sentiment: "positive | neutral | frustrated | angry",
        riskLevel: "low | medium | high",
        draftResponse: "Customer-ready response.",
        confidence: 0.85,
        recommendedAction: "auto_resolve | human_review | escalate",
        escalationReason: "Reason or empty string.",
        policyChecks: [
          {
            policy: "Policy name or text",
            status: "pass | needs_review | fail",
            reason: "Why the policy passed or needs review.",
          },
        ],
      },
      null,
      2,
    ),
    "",
    "Policies:",
    ...policies.map((policy) => `- ${policy}`),
    "",
    "Ticket:",
    `ID: ${ticket.id}`,
    `Subject: ${ticket.subject ?? "Unknown"}`,
    `Description: ${ticket.description}`,
    `Product: ${ticket.product ?? "Unknown"}`,
    `Priority: ${ticket.priority ?? "Unknown"}`,
    `Channel: ${ticket.channel ?? "Unknown"}`,
  ].join("\n");
}
