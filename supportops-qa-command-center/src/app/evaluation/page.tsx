import { EvaluationWorkspace } from "@/components/evaluation-workspace";

export default function EvaluationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-5xl">Evaluation</h1>
        <p className="mt-3 max-w-3xl text-lg text-on-surface-variant">
          Run a random sample of 5, 10, 15, or 20 gold cases, choose a model, and edit the prompt used for the run.
        </p>
      </div>
      {!process.env.DEEPSEEK_API_KEY ? (
        <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          DeepSeek API key is not configured. Add DEEPSEEK_API_KEY to .env before running evaluations.
        </div>
      ) : null}
      <EvaluationWorkspace />
    </div>
  );
}
