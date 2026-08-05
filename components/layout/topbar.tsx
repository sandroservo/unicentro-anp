"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Usuário";
  const email = session?.user?.email ?? "";
  const role = (session?.user?.role as string) ?? "";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="h-14 shrink-0 border-b bg-card flex items-center gap-4 px-4">
      <div className="relative w-full max-w-xs hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar..." className="pl-9 h-9 bg-background" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            render={
              <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-muted transition-colors">
                <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                  {initials}
                </span>
                <span className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{role.toLowerCase()}</span>
                </span>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{name}</span>
                <span className="text-xs text-muted-foreground font-normal">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
