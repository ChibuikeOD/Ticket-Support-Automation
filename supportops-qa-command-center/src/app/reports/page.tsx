export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-5xl">Echo Insights & Reports</h1>
          <p className="mt-3 max-w-3xl text-lg text-on-surface-variant">
            Visualizing high-fidelity diagnostic data and agentic performance across your support pipeline.
          </p>
        </div>
        <a href="/api/reports/markdown" className="echo-gradient-button rounded-xl px-5 py-3 text-sm font-bold">
          Export Markdown
        </a>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel rounded-2xl p-6">
          <div className="echo-label text-on-surface-variant">Success Rate</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-primary">98.2</span>
            <span className="text-on-surface-variant">%</span>
          </div>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
            <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-primary to-secondary" />
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <div className="echo-label text-on-surface-variant">Avg. Sentiment</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-secondary">4.8</span>
            <span className="text-on-surface-variant">/ 5.0</span>
          </div>
          <div className="mt-5 flex h-10 items-end gap-1">
            {[60, 75, 90, 85, 95].map((height) => (
              <div key={height} className="flex-1 rounded-sm bg-secondary/10">
                <div className="rounded-sm bg-secondary" style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <div className="echo-label text-on-surface-variant">Urgency Breakdown</div>
          <div className="mt-6 space-y-3">
            {[
              ["Critical", "12", "bg-error"],
              ["High", "45", "bg-primary"],
              ["Routine", "85", "bg-secondary"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-on-surface-variant">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  {label}
                </span>
                <span className="font-mono font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="glass-panel min-h-96 rounded-3xl p-8 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Diagnostic Velocity</h2>
              <p className="mt-1 text-on-surface-variant">Execution speed over concurrent agents</p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-1">
              <span className="rounded-md bg-surface-container-high px-3 py-1 text-sm text-primary">Live</span>
            </div>
          </div>
          <div className="mt-12 flex h-56 items-end gap-3">
            {[40, 65, 55, 85, 70, 45, 90, 60, 75, 50, 65, 80].map((height, index) => (
              <div
                key={`${height}-${index}`}
                className={`flex-1 rounded-t-lg ${index === 11 ? "bg-secondary/40" : "bg-primary/25"}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        <div className="glass-panel border-l-2 border-l-primary rounded-3xl p-8 lg:col-span-4">
          <div className="echo-label text-primary">Echo Insight</div>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant italic">
            Latency is stabilizing across recent audits. Export the Markdown report when you need a clean handoff for
            review notes, recommendations, and representative examples.
          </p>
        </div>
      </section>
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Generated Reports</h2>
          <span className="echo-ghost-button rounded-xl px-4 py-2 text-sm font-bold">All Types</span>
        </div>
        <div className="glass-panel overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead className="bg-surface-container-high/50">
                <tr>
                  <th className="echo-label px-6 py-5 text-outline">Report Name</th>
                  <th className="echo-label px-6 py-5 text-outline">Created</th>
                  <th className="echo-label px-6 py-5 text-outline">Status</th>
                  <th className="echo-label px-6 py-5 text-outline">Reliability</th>
                  <th className="echo-label px-6 py-5 text-right text-outline">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {[
                  ["Core_Regression_v2.1_Final", "Suite: Production_E2E", "2 hours ago", "Ready", "96%", "primary"],
                  ["Auth_Module_Penetration", "Suite: Security_Hardening", "5 hours ago", "Archived", "82%", "secondary"],
                  ["Endpoint_Stability_JSON", "Suite: API_Diagnostics", "Yesterday", "Ready", "91%", "primary"],
                ].map(([name, suite, created, status, reliability, accent]) => (
                  <tr key={name} className="transition-colors hover:bg-surface-container">
                    <td className="px-6 py-5">
                      <div className="font-bold">{name}</div>
                      <div className="mt-1 text-sm text-on-surface-variant">{suite}</div>
                    </td>
                    <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">{created}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`echo-label rounded-full border px-3 py-1 ${
                          status === "Ready"
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : "border-secondary/30 bg-secondary/10 text-secondary"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-container-highest">
                          <div
                            className={`h-full ${accent === "primary" ? "bg-primary" : "bg-secondary"}`}
                            style={{ width: reliability }}
                          />
                        </div>
                        <span className="font-mono text-sm font-bold">{reliability}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right text-xl text-on-surface-variant">...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-outline-variant/10 p-4 text-center">
            <span className="text-sm font-bold text-primary">Load More Reports</span>
          </div>
        </div>
      </section>
    </div>
  );
}
