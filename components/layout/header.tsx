"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronRight } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** Home crumb href (defaults by role) */
  homeHref?: string;
  homeLabel?: string;
  actions?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  homeHref,
  homeLabel = "Início",
  actions,
}: HeaderProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Usuário";
  const role = (session?.user?.role as string) || "";
  const isAdmin =
    role === "SUPER_ADMIN" || role === "ADMINISTRADOR" || role === "ADMIN" || role === "SUPER";
  const resolvedHome = homeHref ?? (isAdmin ? "/admin" : "/aluno");
  const pageTitle = title ?? `Olá, ${userName}!`;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {pageTitle}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link
                href={resolvedHome}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              >
                {homeLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </li>
            <li className="text-sm text-gray-800 dark:text-white/90">{pageTitle}</li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
