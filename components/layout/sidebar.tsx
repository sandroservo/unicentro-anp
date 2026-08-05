"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen,
  ClipboardList,
  MessageSquare,
  Brain,
  Settings,
  LogOut,
  Users,
  Search,
  GraduationCap,
  Award,
  Eye,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/rbac";
import { useSidebar } from "@/context/sidebar-context";

interface MenuItem {
  icon: React.ComponentType<{ className?: string; size?: number }>;
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
  {
    icon: ClipboardList,
    label: "Banco de Questões",
    href: "/admin/questoes",
    permission: "questions.write",
  },
  { icon: Users, label: "Usuários", href: "/admin/usuarios", permission: "users.manage" },
];

const settingsItem: MenuItem = {
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
  const userName = session?.user?.name || "Usuário";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showLabels = isExpanded || isHovered || isMobileOpen;

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + "/"),
    [pathname]
  );

  const alunoActive = menuItemsAluno.some((i) => isActive(i.href));
  const [alunoOpen, setAlunoOpen] = useState(true);
  const [subMenuHeight, setSubMenuHeight] = useState(0);
  const subMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (alunoActive) setAlunoOpen(true);
  }, [alunoActive]);

  useEffect(() => {
    if (alunoOpen && subMenuRef.current) {
      setSubMenuHeight(subMenuRef.current.scrollHeight);
    }
  }, [alunoOpen, showLabels]);

  const filteredAdmin = adminItems.filter(
    (i) => !i.permission || perms.includes(i.permission)
  );
  const showSettings =
    isAdminRole(userRole) &&
    (!settingsItem.permission || perms.includes(settingsItem.permission));

  const NavLink = ({ item }: { item: MenuItem }) => {
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
          "flex py-8",
          !showLabels ? "lg:justify-center" : "justify-start"
        )}
      >
        <Link href="/aluno">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="UNICENTROMA"
            className={cn("w-auto", showLabels ? "h-10" : "h-8")}
          />
        </Link>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {isAdminRole(userRole) && filteredAdmin.length > 0 && (
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
              <SectionLabel>Aluno</SectionLabel>
              {showLabels ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAlunoOpen((o) => !o)}
                    className={cn(
                      "menu-item group w-full cursor-pointer",
                      alunoActive || alunoOpen
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    )}
                  >
                    <Eye
                      size={20}
                      className={
                        alunoActive || alunoOpen
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }
                    />
                    <span>Visão do Aluno</span>
                    <ChevronDown
                      size={20}
                      className={cn(
                        "ml-auto transition-transform duration-200",
                        alunoOpen
                          ? "rotate-180 text-brand-500"
                          : "text-gray-500"
                      )}
                    />
                  </button>
                  <div
                    ref={subMenuRef}
                    className="overflow-hidden transition-all duration-300"
                    style={{ height: alunoOpen ? `${subMenuHeight}px` : "0px" }}
                  >
                    <ul className="ml-9 mt-2 space-y-1">
                      {menuItemsAluno.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={cn(
                                "menu-dropdown-item",
                                active
                                  ? "menu-dropdown-item-active"
                                  : "menu-dropdown-item-inactive"
                              )}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              ) : (
                <ul className="flex flex-col gap-1">
                  {menuItemsAluno.map((item) => (
                    <li key={item.href}>
                      <NavLink item={item} />
                    </li>
                  ))}
                </ul>
              )}
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

      <div className="border-t border-gray-200 py-4 dark:border-gray-800">
        <div
          className={cn(
            "flex items-center gap-3",
            !showLabels && "lg:justify-center"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-500 dark:bg-brand-500/15">
            {initials}
          </div>
          {showLabels && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {userName}
                </p>
                <p className="truncate text-xs capitalize text-gray-500 dark:text-gray-400">
                  {userRole.toLowerCase()}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:text-red-600"
                aria-label="Sair"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
