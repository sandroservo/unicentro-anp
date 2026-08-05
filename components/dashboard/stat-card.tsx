import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="mt-5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <h4 className="mt-1 text-2xl font-bold text-foreground">{value}</h4>
        {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
      </div>
    </div>
  );
}
