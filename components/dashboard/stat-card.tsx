import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  change,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  change?: { value: string; up: boolean };
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-foreground/80" />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm text-muted-foreground">{label}</span>
          <h4 className="mt-2 text-2xl font-bold text-foreground">{value}</h4>
          {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
        </div>

        {change && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              change.up
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {change.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {change.value}
          </span>
        )}
      </div>
    </div>
  );
}
