import Link from "next/link";
import { notFound } from "next/navigation";
import { EvaluationReportDetail } from "@/components/evaluation-report-detail";
import { loadGoldEvalRunById } from "@/lib/evaluation/report-store";

export const dynamic = "force-dynamic";

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  const report = await loadGoldEvalRunById(id);

  if (!report) {
    notFound();
  }

  const exportHref = `/api/reports/gold-eval/${id}/markdown`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link href="/reports" className="text-sm font-semibold text-primary hover:underline">
            ← Back to reports
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-5xl">
            Evaluation Run
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-on-surface-variant">
            Archived gold evaluation from {new Date(report.generatedAt).toLocaleString()}.
          </p>
        </div>
        <a href={exportHref} className="echo-gradient-button rounded-xl px-5 py-3 text-sm font-bold">
          Export Markdown
        </a>
      </div>

      <section className="glass-panel rounded-3xl p-6">
        <EvaluationReportDetail report={report} exportHref={exportHref} />
      </section>
    </div>
  );
}
