import { prisma } from "@/lib/db";

export default async function RunsPage() {
  const runs = await prisma.automationRun.findMany({
    include: {
      analyses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Evaluation Runs</h1>
        <p className="mt-1 text-sm text-slate-600">Compare prompt and model batches over time.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Run</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Model</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Prompt</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Processed</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Auto</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Review</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Escalate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((run) => {
              const total = run.analyses.length || 1;
              const auto = run.analyses.filter((analysis) => analysis.finalAction === "auto_resolve").length;
              const review = run.analyses.filter((analysis) => analysis.finalAction === "human_review").length;
              const escalate = run.analyses.filter((analysis) => analysis.finalAction === "escalate").length;
              return (
                <tr key={run.id}>
                  <td className="px-4 py-3 text-sm font-medium">{run.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{run.model}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{run.promptVersion}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{run.processedCount}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{Math.round((auto / total) * 100)}%</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{Math.round((review / total) * 100)}%</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{Math.round((escalate / total) * 100)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
