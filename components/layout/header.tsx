"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** Home crumb href (defaults by role) */
  homeHref?: string;
  homeLabel?: string;
  /** Voltar — aparece na frente de Início */
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  homeHref,
  homeLabel = "Início",
  backHref,
  backLabel = "Voltar",
  actions,
}: HeaderProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Usuário";
  const role = (session?.user?.role as string) || "";
  const isAdmin =
    role === "SUPER_ADMIN" ||
    role === "ADMINISTRADOR" ||
    role === "ADMIN" ||
    role === "SUPER";
  const resolvedHome = homeHref ?? (isAdmin ? "/admin" : "/aluno");
  const pageTitle = title ?? `Olá, ${userName}!`;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {pageTitle}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            {backHref && (
              <li>
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white/90"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {backLabel}
                </Link>
              </li>
            )}
            <li>
              <Link
                href={resolvedHome}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              >
                {homeLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </li>
            <li className="text-sm text-gray-800 dark:text-white/90">
              {pageTitle}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
