import { PolicyEditor } from "@/components/policy-editor";
import { prisma } from "@/lib/db";

export default async function PoliciesPage() {
  const rules = await prisma.policyRule.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-5xl">Policy / SOP Studio</h1>
        <p className="mt-3 max-w-2xl text-lg text-on-surface-variant">
          Policies guide the prompt and deterministic guardrails.
        </p>
      </div>
      <PolicyEditor />
      <div className="grid gap-3">
        {rules.map((rule) => (
          <section key={rule.id} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{rule.name}</h2>
              <span className="echo-label rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                {rule.severity}
              </span>
            </div>
            <div className="echo-label mt-2 text-outline">{rule.category}</div>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">{rule.ruleText}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
