export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-slate-600">Export a Markdown QA report for the latest evaluation state.</p>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Markdown QA report</h2>
        <p className="mt-2 text-sm text-slate-600">
          The report includes run metadata, routing distribution, QA metrics, representative examples, and
          recommendations.
        </p>
        <a
          href="/api/reports/markdown"
          className="mt-4 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
        >
          Export Markdown report
        </a>
      </section>
    </div>
  );
}
