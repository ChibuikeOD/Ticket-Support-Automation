const styles: Record<string, string> = {
  seeded: "border-outline-variant/30 bg-surface-container-highest/60 text-on-surface-variant",
  processing: "border-secondary/30 bg-secondary/10 text-secondary",
  auto_resolved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  human_review: "border-primary/30 bg-primary/10 text-primary",
  escalated: "border-error/30 bg-error/10 text-error",
  review_approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  review_edited: "border-primary-container/30 bg-primary-container/10 text-primary",
  review_rejected: "border-error/30 bg-error/10 text-error",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`echo-label inline-flex rounded-full border px-3 py-1 text-[10px] ${
        styles[status] ?? styles.seeded
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
