import { describe, expect, it } from "vitest";
import { buildSupportAnalysisPrompt } from "@/lib/llm/prompt";
import { CATEGORY_FEW_SHOT_EXAMPLES, PRIORITY_FEW_SHOT_EXAMPLES } from "@/lib/llm/few-shot-examples";

describe("support analysis prompt", () => {
  it("includes few-shot examples for every gold category and priority", () => {
    const prompt = buildSupportAnalysisPrompt(
      {
        id: "GOLD-00001",
        subject: null,
        description: "The payment was deducted from my bank account but the transaction shows failed.",
        product: "Payment Gateway",
        priority: "High",
        channel: "Web Form",
      },
      ["Financial-sensitive tickets require human review."],
    );

    for (const example of CATEGORY_FEW_SHOT_EXAMPLES) {
      expect(prompt).toContain(example.label);
      expect(prompt).toContain(example.output.issueCategory);
      expect(prompt).toContain(example.output.customerIntent);
    }

    for (const example of PRIORITY_FEW_SHOT_EXAMPLES) {
      expect(prompt).toContain(example.label);
    }
  });
});
