"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, Bell, LogOut, MoreHorizontal, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "@/context/sidebar-context";
import { Logo } from "./logo";
import { StudentTopNav } from "./student-top-nav";
import { isAdminRole } from "@/lib/rbac";

export function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const name = session?.user?.name ?? "Usuário";
  const email = session?.user?.email ?? "";
  const role = (session?.user?.role as string) ?? "";
  const isAdmin = isAdminRole(role);
  const isStudentArea = pathname.startsWith("/aluno");
  const showStudentNav = !isAdmin || isStudentArea;
  const showSidebarToggle = isAdmin && !isStudentArea;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputRef.current?.value?.trim();
    if (q) router.push(`/aluno/busca?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-99999 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full flex-col">
        <div className="flex w-full items-center justify-between gap-3 px-3 py-3 sm:gap-4 lg:px-6 lg:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {showSidebarToggle && (
              <button
                type="button"
                className="z-99999 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 lg:h-11 lg:w-11 lg:border lg:border-gray-200 dark:lg:border-gray-800"
                onClick={handleToggle}
                aria-label="Alternar menu"
              >
                {isMobileOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.4166 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            )}

            {showStudentNav && (
              <Link href="/aluno" className="min-w-0 shrink-0">
                <Logo />
              </Link>
            )}

            {showStudentNav && (
              <StudentTopNav className="ml-2 hidden min-w-0 flex-1 lg:flex" />
            )}

            {!showStudentNav && (
              <div className="hidden lg:block">
                <form onSubmit={onSearchSubmit}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                      <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Buscar ou digite um comando..."
                      className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs tracking-tight text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                      tabIndex={-1}
                    >
                      <span>⌘</span>
                      <span>K</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setApplicationMenuOpen((o) => !o)}
            className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Menu da aplicação"
          >
            <MoreHorizontal className="h-6 w-6" />
          </button>

          <div
            className={`${
              isApplicationMenuOpen ? "flex" : "hidden"
            } absolute right-3 top-14 z-50 w-[calc(100%-1.5rem)] flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-theme-md dark:border-gray-800 dark:bg-gray-900 sm:w-auto lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin && isStudentArea && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Voltar ao Admin</span>
                </Link>
              )}
              <ThemeToggle />
              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500" />
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-full p-1 pr-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                      {initials}
                    </span>
                    <span className="hidden flex-col items-start leading-tight md:flex">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {name}
                      </span>
                      <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
                        {role.toLowerCase()}
                      </span>
                    </span>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                  {role && (
                    <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
                      {role.toLowerCase()}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showStudentNav && (
          <div className="border-t border-gray-100 px-3 py-2 dark:border-gray-800 lg:hidden">
            <StudentTopNav />
          </div>
        )}
      </div>
    </header>
  );
}
