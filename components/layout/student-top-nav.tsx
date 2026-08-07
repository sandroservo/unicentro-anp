"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { menuItemsAluno } from "./nav-items";

export function StudentTopNav({ className }: { className?: string }) {
  const pathname = usePathname();

  const { data: certVisible } = useQuery({
    queryKey: ["certificates-menu-visible"],
    queryFn: async () => {
      const res = await fetch("/api/aluno/certificates");
      if (!res.ok) return false;
      const d = await res.json();
      return d.visible === true;
    },
    staleTime: 60_000,
  });

  const items = menuItemsAluno.filter((item) => {
    if (item.href === "/aluno/certificados") return certVisible === true;
    return true;
  });

  return (
    <nav
      className={cn(
        "flex items-center gap-1 overflow-x-auto no-scrollbar",
        className
      )}
      aria-label="Menu do aluno"
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
            )}
          >
            <item.icon size={16} className="shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
