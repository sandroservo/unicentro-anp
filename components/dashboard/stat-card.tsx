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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
        <Icon className="h-6 w-6 text-gray-800 dark:text-white/90" />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {value}
          </h4>
          {hint && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
          )}
        </div>

        {change && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              change.up
                ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
            }`}
          >
            {change.up ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {change.value}
          </span>
        )}
      </div>
    </div>
  );
}
