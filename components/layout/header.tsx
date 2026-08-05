"use client";

import { useSession } from "next-auth/react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Usuário";

  return (
    <div className="px-6 py-5 border-b border-border bg-card">
      <h1 className="text-xl font-semibold text-foreground">
        {title ?? `Olá, ${userName}! 👋`}
      </h1>
      <p className="text-sm text-muted-foreground">
        {subtitle ?? (title ? "" : "Continue de onde parou")}
      </p>
    </div>
  );
}
