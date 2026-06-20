import { parseAiAnalysis } from "@/lib/llm/schema";
import { buildSupportAnalysisPrompt } from "@/lib/llm/prompt";

interface AnalyzeTicketOptions {
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
  ticket: {
    id: string;
    description: string;
    subject: string | null;
    product: string | null;
    priority: string | null;
    channel: string | null;
  };
  policies: string[];
}

interface DeepSeekResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function analyzeTicketWithDeepSeek(options: AnalyzeTicketOptions) {
  if (!options.apiKey) {
    throw new Error("DeepSeek API key is missing");
  }

  const response = await fetch(`${options.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        {
          role: "user",
          content: buildSupportAnalysisPrompt(options.ticket, options.policies),
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed with status ${response.status}`);
  }

  const json = (await response.json()) as DeepSeekResponse;
  const content = json.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DeepSeek response did not include message content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("DeepSeek response was not valid JSON");
  }

  return parseAiAnalysis(parsed);
}
