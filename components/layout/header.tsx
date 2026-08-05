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
    <div className="px-6 pt-6 pb-1">
      <h1 className="text-2xl font-bold text-foreground">
        {title ?? `Olá, ${userName}! 👋`}
      </h1>
      <p className="text-sm text-muted-foreground">
        {subtitle ?? (title ? "" : "Continue de onde parou")}
      </p>
    </div>
  );
}
