import { z } from "zod";

export const policyCheckSchema = z.object({
  policy: z.string().min(1),
  status: z.enum(["pass", "needs_review", "fail"]),
  reason: z.string().min(1),
}).strict();

export const aiAnalysisSchema = z.object({
  issueCategory: z.string().min(1),
  customerIntent: z.string().min(1),
  summary: z.string().min(1),
  sentiment: z.enum(["positive", "neutral", "frustrated", "angry"]),
  riskLevel: z.enum(["low", "medium", "high"]),
  draftResponse: z.string().min(1),
  confidence: z.number().min(0).max(1),
  recommendedAction: z.enum(["auto_resolve", "human_review", "escalate"]),
  escalationReason: z.string(),
  policyChecks: z.array(policyCheckSchema),
}).strict();

export type ParsedAiAnalysis = z.infer<typeof aiAnalysisSchema>;

export function parseAiAnalysis(input: unknown): ParsedAiAnalysis {
  const result = aiAnalysisSchema.safeParse(input);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid AI analysis: ${details}`);
  }

  return result.data;
}
