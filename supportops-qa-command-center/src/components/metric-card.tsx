export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="glass-panel echo-glow group relative overflow-hidden rounded-2xl p-6">
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
      <div className="echo-label text-outline">{label}</div>
      <div className="relative mt-2 text-4xl font-bold tracking-tight text-primary">{value}</div>
      {helper ? <div className="relative mt-3 text-sm text-on-surface-variant">{helper}</div> : null}
    </div>
  );
}
