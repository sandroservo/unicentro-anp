"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen, ClipboardList, MessageSquare, Brain, Settings,
  LogOut, Menu, X, Users, Search, GraduationCap, Award, Eye, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/rbac";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  permission?: string;
}

const menuItemsAluno: MenuItem[] = [
  { icon: BookOpen, label: "Meus Cursos", href: "/aluno/cursos" },
  { icon: ClipboardList, label: "Atividades", href: "/aluno/atividades" },
  { icon: MessageSquare, label: "Fórum", href: "/aluno/forum" },
  { icon: Brain, label: "Professor IA", href: "/aluno/tutor" },
  { icon: Search, label: "Busca", href: "/aluno/busca" },
  { icon: Award, label: "Certificados", href: "/aluno/certificados" },
];

const adminItems: MenuItem[] = [
  { icon: GraduationCap, label: "Painel Admin", href: "/admin" },
  { icon: Users, label: "Alunos", href: "/admin/alunos", permission: "students.read" },
  { icon: BookOpen, label: "Cursos", href: "/admin/cursos", permission: "courses.read" },
  { icon: ClipboardList, label: "Banco de Questões", href: "/admin/questoes", permission: "questions.write" },
];

const settingsItem: MenuItem = {
  icon: Settings, label: "Configurações", href: "/admin/configuracoes", permission: "settings.manage",
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role as string) || "ALUNO";
  const perms = (session?.user?.permissions as string[] | undefined) ?? [];
  const userName = session?.user?.name || "Usuário";
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const alunoActive = menuItemsAluno.some(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );
  const [alunoOpen, setAlunoOpen] = useState(true);

  const NavItem = ({ item }: { item: MenuItem }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          active
            ? "bg-primary/10 text-primary"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon
          size={20}
          className={active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}
        />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const SectionLabel = ({ children }: { children: string }) =>
    collapsed ? (
      <div className="my-2 h-px bg-border" />
    ) : (
      <p className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {children}
      </p>
    );

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[84px] px-2" : "w-[260px] px-4"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-20 shrink-0", collapsed ? "justify-center" : "justify-between px-1")}>
        {!collapsed && (
          <Link href="/aluno">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="UNICENTROMA" className="h-11 w-auto" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Recolher menu"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto pb-4">
        {isAdminRole(userRole) && (
          <>
            <SectionLabel>Administração</SectionLabel>
            <div className="space-y-1">
              {adminItems
                .filter((i) => !i.permission || perms.includes(i.permission))
                .map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
            </div>
          </>
        )}

        {collapsed ? (
          <>
            <SectionLabel>Aluno</SectionLabel>
            <div className="space-y-1">
              {menuItemsAluno.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-2">
            <button
              onClick={() => setAlunoOpen((o) => !o)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                alunoActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <Eye
                size={20}
                className={alunoActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}
              />
              <span>Visão do Aluno</span>
              <ChevronDown
                size={16}
                className={cn("ml-auto transition-transform", alunoOpen && "rotate-180")}
              />
            </button>
            {alunoOpen && (
              <div className="mt-1 ml-4 space-y-1 border-l border-border pl-3">
                {menuItemsAluno.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isAdminRole(userRole) &&
          (!settingsItem.permission || perms.includes(settingsItem.permission)) && (
            <div className="mt-1">
              <NavItem item={settingsItem} />
            </div>
          )}
      </nav>

      {/* User */}
      <div className="border-t border-border py-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{userName}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">{userRole.toLowerCase()}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
