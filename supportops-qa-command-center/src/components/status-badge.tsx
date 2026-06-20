const styles: Record<string, string> = {
  seeded: "bg-slate-100 text-slate-700",
  processing: "bg-blue-100 text-blue-700",
  auto_resolved: "bg-emerald-100 text-emerald-700",
  human_review: "bg-amber-100 text-amber-800",
  escalated: "bg-red-100 text-red-700",
  review_approved: "bg-emerald-100 text-emerald-700",
  review_edited: "bg-indigo-100 text-indigo-700",
  review_rejected: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status] ?? styles.seeded}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
