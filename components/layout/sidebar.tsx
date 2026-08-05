"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  GraduationCap,
  Home,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Brain,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Users,
  BarChart3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/rbac";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  permission?: string; // se definido, só aparece quando a sessão tem a permissão
}

const menuItemsAluno: MenuItem[] = [
  { icon: Home, label: "Dashboard", href: "/aluno" },
  { icon: BookOpen, label: "Meus Cursos", href: "/aluno/cursos" },
  { icon: ClipboardList, label: "Atividades", href: "/aluno/atividades" },
  { icon: MessageSquare, label: "Fórum", href: "/aluno/forum" },
  { icon: Brain, label: "Professor IA", href: "/aluno/tutor" },
  { icon: Search, label: "Busca", href: "/aluno/busca" },
  { icon: GraduationCap, label: "Certificados", href: "/aluno/certificados" },
];

const menuItems = menuItemsAluno;

const adminItems: MenuItem[] = [
  { icon: GraduationCap, label: "Painel Admin", href: "/admin" },
  { icon: Users, label: "Alunos", href: "/admin/alunos", permission: "students.read" },
  { icon: BookOpen, label: "Cursos", href: "/admin/cursos", permission: "courses.read" },
  { icon: ClipboardList, label: "Banco de Questões", href: "/admin/questoes", permission: "questions.write" },
  { icon: Settings, label: "Configurações", href: "/admin/configuracoes", permission: "settings.manage" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role as string) || "ALUNO";
  const perms = (session?.user?.permissions as string[] | undefined) ?? [];
  const userName = session?.user?.name || "Usuário";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/aluno" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="UNICENTROMA" className="h-9 w-auto" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Menu
          </p>
        )}
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin Menu */}
        {isAdminRole(userRole) && (
          <>
            <div className="pt-4 mt-4 border-t border-border">
              {!collapsed && (
                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Administração
                </p>
              )}
              {adminItems
                .filter((item) => !item.permission || perms.includes(item.permission))
                .map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon size={20} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole.toLowerCase()}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "mt-3 flex items-center gap-2 text-muted-foreground hover:text-red-600 transition-colors",
            collapsed ? "justify-center w-full" : "px-1"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
