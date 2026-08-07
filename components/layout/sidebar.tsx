"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  ClipboardList,
  Settings,
  Users,
  GraduationCap,
  MoreHorizontal,
  Eye,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/rbac";
import { useSidebar } from "@/context/sidebar-context";
import { Logo } from "./logo";
import type { NavItem } from "./nav-items";

const adminItems: NavItem[] = [
  { icon: GraduationCap, label: "Painel Admin", href: "/admin" },
  { icon: Users, label: "Alunos", href: "/admin/alunos", permission: "students.read" },
  { icon: BookOpen, label: "Turmas", href: "/admin/cursos", permission: "courses.read" },
  {
    icon: MessageSquare,
    label: "Fórum",
    href: "/admin/forum",
    permission: "courses.read",
  },
  {
    icon: ClipboardList,
    label: "Banco de Questões",
    href: "/admin/questoes",
    permission: "questions.write",
  },
  { icon: Users, label: "Usuários", href: "/admin/usuarios", permission: "users.manage" },
];

const studentViewItem: NavItem = {
  icon: Eye,
  label: "Visão do Aluno",
  href: "/aluno/cursos",
};

const settingsItem: NavItem = {
  icon: Settings,
  label: "Configurações",
  href: "/admin/configuracoes",
  permission: "settings.manage",
};

export function Sidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role as string) || "ALUNO";
  const perms = (session?.user?.permissions as string[] | undefined) ?? [];

  const showLabels = isExpanded || isHovered || isMobileOpen;

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + "/"),
    [pathname]
  );

  // Sidebar só para administração — menu do aluno fica fixo no topo
  if (!isAdminRole(userRole)) return null;

  const filteredAdmin = adminItems.filter(
    (i) => !i.permission || perms.includes(i.permission)
  );
  const showSettings =
    !settingsItem.permission || perms.includes(settingsItem.permission);

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "menu-item group",
          active ? "menu-item-active" : "menu-item-inactive",
          !showLabels && "lg:justify-center"
        )}
      >
        <item.icon
          size={20}
          className={active ? "menu-item-icon-active" : "menu-item-icon-inactive"}
        />
        {showLabels && <span>{item.label}</span>}
      </Link>
    );
  };

  const SectionLabel = ({ children }: { children: string }) => (
    <h2
      className={cn(
        "mb-4 flex text-xs uppercase leading-5 text-gray-400",
        !showLabels ? "lg:justify-center" : "justify-start"
      )}
    >
      {showLabels ? children : <MoreHorizontal className="h-4 w-4" />}
    </h2>
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0",
        isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex py-6",
          !showLabels ? "lg:justify-center" : "justify-start"
        )}
      >
        <Link href="/admin" className="min-w-0 block">
          <Logo showWordmark={showLabels} markOnly={!showLabels} />
        </Link>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {filteredAdmin.length > 0 && (
              <div>
                <SectionLabel>Administração</SectionLabel>
                <ul className="flex flex-col gap-1">
                  {filteredAdmin.map((item) => (
                    <li key={item.href}>
                      <NavLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <SectionLabel>Pré-visualização</SectionLabel>
              <ul className="flex flex-col gap-1">
                <li>
                  <NavLink item={studentViewItem} />
                </li>
              </ul>
            </div>

            {showSettings && (
              <div>
                <SectionLabel>Sistema</SectionLabel>
                <ul className="flex flex-col gap-1">
                  <li>
                    <NavLink item={settingsItem} />
                  </li>
                </ul>
              </div>
            )}
          </div>
        </nav>
      </div>

    </aside>
  );
}
