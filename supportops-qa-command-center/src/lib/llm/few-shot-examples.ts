export interface FewShotExample {
  label: string;
  ticket: {
    description: string;
    product: string;
    priority: string;
    channel: string;
  };
  output: {
    issueCategory: string;
    customerIntent: string;
    recommendedAction: "auto_resolve" | "human_review" | "escalate";
    riskLevel: "low" | "medium" | "high";
    sentiment: "positive" | "neutral" | "frustrated" | "angry";
  };
}

export const CATEGORY_FEW_SHOT_EXAMPLES: FewShotExample[] = [
  {
    label: "Payment Problem",
    ticket: {
      description: "The payment was deducted from my bank account but the transaction shows failed.",
      product: "Payment Gateway",
      priority: "High",
      channel: "Web Form",
    },
    output: {
      issueCategory: "Payment Problem",
      customerIntent: "Resolve failed transaction after payment deduction",
      recommendedAction: "human_review",
      riskLevel: "medium",
      sentiment: "frustrated",
    },
  },
  {
    label: "Bug Report",
    ticket: {
      description: "The application crashes whenever I try to upload a file.",
      product: "API Service",
      priority: "Medium",
      channel: "Web Form",
    },
    output: {
      issueCategory: "Bug Report",
      customerIntent: "Fix application crash during file upload",
      recommendedAction: "human_review",
      riskLevel: "medium",
      sentiment: "frustrated",
    },
  },
  {
    label: "Security Concern",
    ticket: {
      description: "Two-factor authentication codes are not being delivered to my phone.",
      product: "Web Portal",
      priority: "High",
      channel: "Email",
    },
    output: {
      issueCategory: "Security Concern",
      customerIntent: "Receive two-factor authentication code",
      recommendedAction: "escalate",
      riskLevel: "high",
      sentiment: "frustrated",
    },
  },
  {
    label: "Performance Issue",
    ticket: {
      description: "I am experiencing very slow performance while using the dashboard.",
      product: "Web Portal",
      priority: "Urgent",
      channel: "Chat",
    },
    output: {
      issueCategory: "Performance Issue",
      customerIntent: "Resolve slow dashboard performance",
      recommendedAction: "escalate",
      riskLevel: "high",
      sentiment: "frustrated",
    },
  },
  {
    label: "Data Sync Issue",
    ticket: {
      description: "The system is not syncing data across devices properly.",
      product: "Cloud Storage",
      priority: "Urgent",
      channel: "Phone",
    },
    output: {
      issueCategory: "Data Sync Issue",
      customerIntent: "Restore cross-device data sync",
      recommendedAction: "auto_resolve",
      riskLevel: "low",
      sentiment: "neutral",
    },
  },
  {
    label: "Subscription Cancellation",
    ticket: {
      description: "My subscription was cancelled without my request and I need clarification.",
      product: "Cloud Storage",
      priority: "Urgent",
      channel: "Web Form",
    },
    output: {
      issueCategory: "Subscription Cancellation",
      customerIntent: "Restore or clarify subscription status",
      recommendedAction: "human_review",
      riskLevel: "medium",
      sentiment: "frustrated",
    },
  },
  {
    label: "Login Issue",
    ticket: {
      description: "I am unable to access my account after entering the correct credentials.",
      product: "Analytics Dashboard",
      priority: "Medium",
      channel: "Phone",
    },
    output: {
      issueCategory: "Login Issue",
      customerIntent: "Regain account access",
      recommendedAction: "human_review",
      riskLevel: "medium",
      sentiment: "frustrated",
    },
  },
  {
    label: "Refund Request",
    ticket: {
      description: "I would like to request a refund for the recent charge.",
      product: "Billing System",
      priority: "High",
      channel: "Email",
    },
    output: {
      issueCategory: "Refund Request",
      customerIntent: "Request refund for recent charge",
      recommendedAction: "human_review",
      riskLevel: "medium",
      sentiment: "neutral",
    },
  },
];

export const PRIORITY_FEW_SHOT_EXAMPLES: FewShotExample[] = [
  {
    label: "Urgent priority",
    ticket: {
      description: "The dashboard has been unusably slow for our entire team since this morning.",
      product: "Web Portal",
      priority: "Urgent",
      channel: "Chat",
    },
    output: {
      issueCategory: "Performance Issue",
      customerIntent: "Resolve slow dashboard performance",
      recommendedAction: "escalate",
      riskLevel: "high",
      sentiment: "angry",
    },
  },
  {
    label: "High priority",
    ticket: {
      description: "My card was charged twice for the same invoice.",
      product: "Billing System",
      priority: "High",
      channel: "Email",
    },
    output: {
      issueCategory: "Payment Problem",
      customerIntent: "Clarify billing statement discrepancy",
      recommendedAction: "human_review",
      riskLevel: "medium",
      sentiment: "frustrated",
    },
  },
  {
    label: "Medium priority",
    ticket: {
      description: "Export to CSV fails with an unknown error message.",
      product: "Analytics Dashboard",
      priority: "Medium",
      channel: "Web Form",
    },
    output: {
      issueCategory: "Bug Report",
      customerIntent: "Fix application crash during file upload",
      recommendedAction: "human_review",
      riskLevel: "medium",
      sentiment: "neutral",
    },
  },
  {
    label: "Low priority",
    ticket: {
      description: "Photos on my phone are not appearing in the web library yet.",
      product: "Cloud Storage",
      priority: "Low",
      channel: "Email",
    },
    output: {
      issueCategory: "Data Sync Issue",
      customerIntent: "Restore cross-device data sync",
      recommendedAction: "auto_resolve",
      riskLevel: "low",
      sentiment: "neutral",
    },
  },
];

function formatFewShotExample(example: FewShotExample): string {
  return [
    `### ${example.label}`,
    `Ticket: ${example.ticket.description}`,
    `Product: ${example.ticket.product} | Priority: ${example.ticket.priority} | Channel: ${example.ticket.channel}`,
    "Expected labels:",
    JSON.stringify(
      {
        issueCategory: example.output.issueCategory,
        customerIntent: example.output.customerIntent,
        recommendedAction: example.output.recommendedAction,
        riskLevel: example.output.riskLevel,
        sentiment: example.output.sentiment,
      },
      null,
      2,
    ),
  ].join("\n");
}

export function buildFewShotPromptSection(): string {
  return [
    "Few-shot examples by issue category:",
    ...CATEGORY_FEW_SHOT_EXAMPLES.map(formatFewShotExample),
    "",
    "Few-shot examples by ticket priority:",
    ...PRIORITY_FEW_SHOT_EXAMPLES.map(formatFewShotExample),
    "",
    "Use the exact issueCategory and customerIntent phrasing style from the closest example.",
    "Choose recommendedAction conservatively: escalate for security and severe impact, human_review for billing/refunds/account/login/subscription, auto_resolve only for low-risk routine technical fixes.",
  ].join("\n\n");
}
