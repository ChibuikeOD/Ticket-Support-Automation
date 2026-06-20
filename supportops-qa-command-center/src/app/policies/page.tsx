import { PolicyEditor } from "@/components/policy-editor";
import { prisma } from "@/lib/db";

export default async function PoliciesPage() {
  const rules = await prisma.policyRule.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Policy / SOP Studio</h1>
        <p className="mt-1 text-sm text-slate-600">Policies guide the prompt and deterministic guardrails.</p>
      </div>
      <PolicyEditor />
      <div className="grid gap-3">
        {rules.map((rule) => (
          <section key={rule.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{rule.name}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{rule.severity}</span>
            </div>
            <div className="mt-1 text-sm text-slate-500">{rule.category}</div>
            <p className="mt-3 text-sm text-slate-700">{rule.ruleText}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
